const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

exports.updateSelf = async (req, res) => {
  try {
    const { name, password} = req.body;
    
    // if (email || role) {
    //   return res.status(400).json({ message: 'Cannot update email or role.' });
    // }

    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await db.collection('users').doc(req.user.id).update(updateData);
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Class Management
// ==========================================

// Create a new class
exports.createClass = async (req, res) => {
  try {
    const { semesterNumber, semester, subjectName, sections } = req.body;

    if (!semesterNumber || !semester || !subjectName || !sections) {
      return res.status(400).json({ message: 'semesterNumber, semester, subjectName, and sections are required.' });
    }

    const teacherId = req.user.id;

    const newClassRef = db.collection('classes').doc();
    const classData = {
      id: newClassRef.id,
      teacherId,
      semesterNumber,
      semester,
      subjectName,
      sections,
      createdAt: new Date().toISOString()
    };

    await newClassRef.set(classData);

    res.status(201).json({ message: 'Class created successfully', data: classData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all classes created by the logged-in teacher
exports.getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const classesSnapshot = await db.collection('classes').where('teacherId', '==', teacherId).get();

    const classes = [];
    classesSnapshot.forEach((doc) => {
      classes.push(doc.data());
    });

    res.status(200).json({ data: classes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Student Management in Class
// ==========================================

// Verify if a student exists by email
exports.verifyStudentEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Student email is required.' });
    }

    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .where('role', '==', 'student')
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ message: 'Student with this email does not exist or is not a student.' });
    }

    const studentDoc = usersSnapshot.docs[0];
    const studentData = { id: studentDoc.id, ...studentDoc.data() };
    
    // Removing sensitive info
    delete studentData.password;

    res.status(200).json({ message: 'Student found', data: studentData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a student to a class
exports.addStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentEmail, studentName, rollNo, section } = req.body;

    if (!studentEmail || !studentName || !rollNo || !section) {
      return res.status(400).json({ message: 'studentEmail, studentName, rollNo, and section are required.' });
    }

    // 1. Check if class exists and belongs to this teacher
    const classSnapshot = await db.collection('classes').doc(classId).get();
    
    if (!classSnapshot.exists) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    const classData = classSnapshot.data();
    if (classData.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this class.' });
    }

    // 2. Verify student exists in 'users' collection
    const usersSnapshot = await db.collection('users')
      .where('email', '==', studentEmail)
      .where('role', '==', 'student')
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ message: 'This student is not registered.' });
    }

    const studentId = usersSnapshot.docs[0].id;

    // 3. Check if student is already in this class
    const existingStudentSnapshot = await db.collection('class_students')
      .where('classId', '==', classId)
      .where('studentId', '==', studentId)
      .get();

    if (!existingStudentSnapshot.empty) {
      return res.status(400).json({ message: 'Student is already added to this class.' });
    }

    // 4. Add student to 'class_students' collection
    const classStudentRef = db.collection('class_students').doc();
    const classStudentData = {
      id: classStudentRef.id,
      classId,
      studentId,
      studentName,
      studentEmail,
      rollNo,
      section,
      addedAt: new Date().toISOString()
    };

    await classStudentRef.set(classStudentData);

    res.status(201).json({ message: 'Student successfully added to class', data: classStudentData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all students for a specific class
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify class ownership
    const classSnapshot = await db.collection('classes').doc(classId).get();
    if (!classSnapshot.exists || classSnapshot.data().teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized or class not found.' });
    }

    const studentsSnapshot = await db.collection('class_students')
      .where('classId', '==', classId)
      .get();

    const students = [];
    studentsSnapshot.forEach((doc) => {
      students.push(doc.data());
    });

    res.status(200).json({ data: students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a student from a class
exports.removeStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    // 1. Verify class ownership
    const classSnapshot = await db.collection('classes').doc(classId).get();
    if (!classSnapshot.exists) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    if (classSnapshot.data().teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this class.' });
    }

    // 2. Find and delete the student record from class_students
    const existingStudentSnapshot = await db.collection('class_students')
      .where('classId', '==', classId)
      .where('studentId', '==', studentId)
      .get();

    if (existingStudentSnapshot.empty) {
      return res.status(404).json({ message: 'Student is not in this class.' });
    }

    // Delete the document(s)
    const batch = db.batch();
    existingStudentSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(200).json({ message: 'Student successfully removed from class' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Attendance Management
// ==========================================

// Mark/Submit Attendance for a whole class on a specific date
exports.markAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body; 
    // records should be an array: [{ studentId: '...', status: 'Present' | 'Absent' }, ...]

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Date and records array are required.' });
    }

    // 1. Verify class ownership
    const classSnapshot = await db.collection('classes').doc(classId).get();
    if (!classSnapshot.exists) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    if (classSnapshot.data().teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this class.' });
    }

    // 2. Check if attendance is already marked for today
    const existingAttendanceSnap = await db.collection('attendance')
      .where('classId', '==', classId)
      .where('date', '==', date)
      .get();

    if (!existingAttendanceSnap.empty) {
      return res.status(400).json({ message: 'Attendance already marked for today.' });
    }

    // 3. Fetch current class students to add their names & roll no to the attendance log permanently
    const studentsSnap = await db.collection('class_students').where('classId', '==', classId).get();
    const studentMap = {};
    studentsSnap.forEach(doc => {
      const data = doc.data();
      studentMap[data.studentId] = {
        name: data.studentName,
        rollNo: data.rollNo
      };
    });

    // 4. Build enriched records array
    let totalPresent = 0;
    let totalAbsent = 0;

    const enrichedRecords = records.map(record => {
      const isPresent = record.status.toLowerCase() === 'present';
      if (isPresent) totalPresent++;
      else totalAbsent++;

      return {
        studentId: record.studentId,
        studentName: studentMap[record.studentId]?.name || 'Unknown',
        rollNo: studentMap[record.studentId]?.rollNo || 'Unknown',
        status: record.status
      };
    });

    // 5. Save attendance in the database
    const newAttendanceRef = db.collection('attendance').doc();
    const attendanceData = {
      id: newAttendanceRef.id,
      classId,
      teacherId: req.user.id,
      date,
      totalStudents: enrichedRecords.length,
      totalPresent,
      totalAbsent,
      records: enrichedRecords,
      createdAt: new Date().toISOString()
    };

    await newAttendanceRef.set(attendanceData);

    res.status(201).json({ message: 'Attendance saved successfully', data: attendanceData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Attendance History by Date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query; // date pass from frontend date picker e.g., '2026-04-18'

    if (!date) {
      return res.status(400).json({ message: 'Date is required as query parameter.' });
    }

    // Verify ownership
    const classSnapshot = await db.collection('classes').doc(classId).get();
    if (!classSnapshot.exists || classSnapshot.data().teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized or class not found.' });
    }

    const attendanceSnap = await db.collection('attendance')
      .where('classId', '==', classId)
      .where('date', '==', date)
      .get();

    if (attendanceSnap.empty) {
      return res.status(200).json({ message: 'No attendance marked for this date.', data: null });
    }

    const attendanceData = attendanceSnap.docs[0].data();
    res.status(200).json({ data: attendanceData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Overall Student Summary (All Time)
exports.getStudentSummary = async (req, res) => {
  try {
    const { classId } = req.params;

    // Verify ownership
    const classSnapshot = await db.collection('classes').doc(classId).get();
    if (!classSnapshot.exists || classSnapshot.data().teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized or class not found.' });
    }

    // 1. Get all students currently in the class
    const studentsSnap = await db.collection('class_students').where('classId', '==', classId).get();
    const summaryMap = {};
    
    studentsSnap.forEach(doc => {
      const data = doc.data();
      summaryMap[data.studentId] = {
        studentId: data.studentId,
        studentName: data.studentName,
        rollNo: data.rollNo,
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
        statusLevel: 'Good'
      };
    });

    // 2. Fetch all attendance records for this class
    const attendanceSnap = await db.collection('attendance').where('classId', '==', classId).get();
    const totalLectures = attendanceSnap.size;

    // 3. Aggregate data
    attendanceSnap.forEach(doc => {
      const data = doc.data();
      data.records.forEach(record => {
        if (summaryMap[record.studentId]) {
          summaryMap[record.studentId].total += 1;
          if (record.status.toLowerCase() === 'present') {
            summaryMap[record.studentId].present += 1;
          } else {
            summaryMap[record.studentId].absent += 1;
          }
        }
      });
    });

    // 4. Calculate Percentage and Add Visual Risk Label ('Danger' logic)
    const summaryArray = Object.values(summaryMap).map(student => {
      if (student.total > 0) {
        student.percentage = Math.round((student.present / student.total) * 100);
      } else {
        student.percentage = 0;
      }

      // Add simple condition to send warning level to frontend
      if (student.percentage < 75) {
        student.statusLevel = 'Danger';
      } else if (student.percentage < 85) {
         student.statusLevel = 'Warning';
      } else {
         student.statusLevel = 'Good';
      }

      return student;
    });

    res.status(200).json({ 
      data: {
        totalLectures,
        students: summaryArray
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// Mark All Attendance (Present / Absent)
// ==========================================

// Mark all students in a class as Present or Absent for a specific date
exports.markAllAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, status } = req.body; 
    // status should be strictly 'Present' or 'Absent'

    if (!date || !status || (status.toLowerCase() !== 'present' && status.toLowerCase() !== 'absent')) {
      return res.status(400).json({ message: 'Valid date and status (Present/Absent) are required.' });
    }

    // 1. Verify class ownership
    const classSnapshot = await db.collection('classes').doc(classId).get();
    if (!classSnapshot.exists) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    if (classSnapshot.data().teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this class.' });
    }

    // 2. Check if attendance is already marked for today
    const existingAttendanceSnap = await db.collection('attendance')
      .where('classId', '==', classId)
      .where('date', '==', date)
      .get();

    if (!existingAttendanceSnap.empty) {
      return res.status(400).json({ message: 'Attendance already marked for today.' });
    }

    // 3. Fetch current class students
    const studentsSnap = await db.collection('class_students').where('classId', '==', classId).get();

    if (studentsSnap.empty) {
      return res.status(400).json({ message: 'No students found in this class to mark attendance.' });
    }

    const isPresent = status.toLowerCase() === 'present';
    const totalStudents = studentsSnap.size;
    const totalPresent = isPresent ? totalStudents : 0;
    const totalAbsent = !isPresent ? totalStudents : 0;

    const enrichedRecords = [];
    studentsSnap.forEach(doc => {
      const data = doc.data();
      enrichedRecords.push({
        studentId: data.studentId,
        studentName: data.studentName,
        rollNo: data.rollNo,
        status: isPresent ? 'Present' : 'Absent'
      });
    });

    // 4. Save attendance in the database
    const newAttendanceRef = db.collection('attendance').doc();
    const attendanceData = {
      id: newAttendanceRef.id,
      classId,
      teacherId: req.user.id,
      date,
      totalStudents,
      totalPresent,
      totalAbsent,
      records: enrichedRecords,
      createdAt: new Date().toISOString()
    };

    await newAttendanceRef.set(attendanceData);

    res.status(201).json({ 
      message: `Successfully marked all students as ${isPresent ? 'Present' : 'Absent'}`, 
      data: attendanceData 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download attendance for a specific date as CSV
exports.downloadAttendanceCSV = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    // 1. Verify class ownership
    const classSnapshot = await db.collection('classes').doc(classId).get();
    if (!classSnapshot.exists || classSnapshot.data().teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized or class not found.' });
    }

    const classData = classSnapshot.data();

    // 2. Get attendance
    const attendanceSnap = await db.collection('attendance')
      .where('classId', '==', classId)
      .where('date', '==', date)
      .get();

    if (attendanceSnap.empty) {
      return res.status(404).json({ message: 'No attendance found for this date.' });
    }

    const attendance = attendanceSnap.docs[0].data();

    // 3. Prepare table data
    const { arrayToCsv } = require('../utils/csvExport');

    const headers = ['studentName', 'rollNo', 'status'];
    const rows = attendance.records.map(r => ({
      studentName: r.studentName,
      rollNo: r.rollNo,
      status: r.status
    }));

    const tableCsv = arrayToCsv(headers, rows);

    // 4. Calculate per-date summary
    let present = 0;
    let absent = 0;

    attendance.records.forEach(r => {
      if (r.status.toLowerCase() === 'present') present++;
      else absent++;
    });


    // 5. Build final CSV (per-date summary above attendance table)
    let finalCsv = "";

    // Header section
    finalCsv += `Class: ${classData.subjectName}\r\n`;
    finalCsv += `Semester: ${classData.semester} (${classData.semesterNumber})\r\n`;
    finalCsv += `Section: ${classData.sections}\r\n`;
    finalCsv += `Date: ${date}\r\n`;

    // Per-date Summary (placed below Date, above attendance table)
    finalCsv += `\r\nSummary\r\n`;
    finalCsv += `Total Students,${attendance.records.length}\r\n`;
    finalCsv += `Present,${present}\r\n`;
    finalCsv += `Absent,${absent}\r\n`;

    // Blank line then Table
    finalCsv += `\r\n`;
    finalCsv += tableCsv;

    // 6. Append All-time Student Summary (aggregated across all attendance records)
    // Build student map from class_students
    const studentsSnap = await db.collection('class_students').where('classId', '==', classId).get();
    const summaryMap = {};
    studentsSnap.forEach(doc => {
      const d = doc.data();
      summaryMap[d.studentId] = {
        Name: d.studentName,
        Total: 0,
        Present: 0,
        Absent: 0,
        Percentage: 0
      };
    });

    // Fetch all attendance for this class and aggregate
    const allAttendanceSnap = await db.collection('attendance').where('classId', '==', classId).get();
    allAttendanceSnap.forEach(doc => {
      const a = doc.data();
      a.records.forEach(r => {
        if (summaryMap[r.studentId]) {
          summaryMap[r.studentId].Total += 1;
          if (r.status && r.status.toLowerCase() === 'present') summaryMap[r.studentId].Present += 1;
          else summaryMap[r.studentId].Absent += 1;
        }
      });
    });

    // Compute percentage and prepare rows
    const summaryHeaders = ['Name', 'Total', 'Present', 'Absent', 'Percentage'];
    const summaryRows = Object.values(summaryMap).map(s => {
      const pct = s.Total > 0 ? Math.round((s.Present / s.Total) * 100) : 0;
      return {
        Name: s.Name,
        Total: s.Total,
        Present: s.Present,
        Absent: s.Absent,
        Percentage: pct + '%'
      };
    });

    // Sort by Name for consistent output
    summaryRows.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));

    // Convert to CSV and append
    finalCsv += `\r\n\r\nStudent Summary (All Time)\r\n`;
    finalCsv += arrayToCsv(summaryHeaders, summaryRows);

    // 6. Send CSV response 
    const filename = `attendance-Class-${classData.semesterNumber}-${classData.sections}-Semester-${classData.semester}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(finalCsv);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};