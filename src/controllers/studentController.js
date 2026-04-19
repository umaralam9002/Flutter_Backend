const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

// Get own profile (students)
exports.getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

    const userData = userDoc.data();
    // do not send password
    if (userData.password) delete userData.password;

    res.status(200).json({ data: { id: userDoc.id, ...userData } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update own profile - students may only change password
exports.updateSelf = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').doc(req.user.id).update({ password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all classes the student is enrolled in, with attendance summary per class
exports.getMyClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // find class_student docs for this student
    const classStudentsSnap = await db.collection('class_students').where('studentId', '==', studentId).get();

    const classes = [];

    // for each entry, fetch class info and compute attendance summary
    for (const doc of classStudentsSnap.docs) {
      const csData = doc.data();
      const classId = csData.classId;

      const classDoc = await db.collection('classes').doc(classId).get();
      if (!classDoc.exists) continue;

      const classData = classDoc.data();

      // fetch attendance records for this class
      const attendanceSnap = await db.collection('attendance').where('classId', '==', classId).get();
      const totalLectures = attendanceSnap.size;

      // count presents for this student
      let presentCount = 0;
      attendanceSnap.forEach(aDoc => {
        const aData = aDoc.data();
        const record = (aData.records || []).find(r => r.studentId === studentId);
        if (record && String(record.status).toLowerCase() === 'present') presentCount++;
      });

      const percentage = totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0;

      classes.push({
        classId,
        subjectName: classData.subjectName,
        semester: classData.semester,
        semesterNumber: classData.semesterNumber,
        sections: classData.sections,
        teacherId: classData.teacherId,
        rollNo: csData.rollNo,
        section: csData.section,
        presentCount,
        totalLectures,
        absentCount: Math.max(0, totalLectures - presentCount),
        attendedDates: (() => {
          const dates = [];
          attendanceSnap.forEach(aDoc => {
            const aData = aDoc.data();
            const record = (aData.records || []).find(r => r.studentId === studentId);
            if (record && String(record.status).toLowerCase() === 'present') dates.push(aData.date);
          });
          // sort desc
          return dates.sort((a, b) => (a < b ? 1 : -1));
        })(),
        percentage
      });
    }

    res.status(200).json({ data: classes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get detailed attendance history for a student in a specific class
exports.getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.user.id;

    // Verify student is part of class
    const enrolledSnap = await db.collection('class_students')
      .where('classId', '==', classId)
      .where('studentId', '==', studentId)
      .get();

    if (enrolledSnap.empty) {
      return res.status(403).json({ message: 'You are not enrolled in this class.' });
    }

    // fetch attendance docs for class
    const attendanceSnap = await db.collection('attendance')
      .where('classId', '==', classId)
      .get();

    const history = [];
    const attendedDates = [];
    let totalLectures = 0;
    let presentCount = 0;

    attendanceSnap.forEach(doc => {
      const a = doc.data();
      totalLectures++;
      const record = (a.records || []).find(r => r.studentId === studentId);
      const status = record ? record.status : 'Absent';
      if (String(status).toLowerCase() === 'present') {
        presentCount++;
        attendedDates.push(a.date);
      }

      history.push({ date: a.date, status });
    });

    // sort by date descending (assuming date stored as ISO or comparable string)
    history.sort((a, b) => (a.date < b.date ? 1 : -1));

    const absentCount = Math.max(0, totalLectures - presentCount);
    const percentage = totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0;

    // sort history by date desc
    history.sort((a, b) => (a.date < b.date ? 1 : -1));

    res.status(200).json({ data: { totalLectures, presentCount, absentCount, percentage, attendedDates: attendedDates.sort((a,b)=>(a<b?1:-1)), history } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get complete attendance record for the student across all enrolled classes
exports.getAllAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    // find class_student docs for this student
    const classStudentsSnap = await db.collection('class_students').where('studentId', '==', studentId).get();

    if (classStudentsSnap.empty) {
      return res.status(200).json({ data: [] });
    }

    const result = [];

    for (const csDoc of classStudentsSnap.docs) {
      const csData = csDoc.data();
      const classId = csData.classId;

      const classDoc = await db.collection('classes').doc(classId).get();
      if (!classDoc.exists) continue;

      const classData = classDoc.data();

      // fetch all attendance for this class
      const attendanceSnap = await db.collection('attendance').where('classId', '==', classId).get();

      const history = [];
      let totalLectures = 0;
      let presentCount = 0;

      attendanceSnap.forEach(aDoc => {
        const a = aDoc.data();
        totalLectures++;
        const record = (a.records || []).find(r => r.studentId === studentId);
        const status = record ? record.status : 'Absent';
        if (String(status).toLowerCase() === 'present') presentCount++;
        history.push({ date: a.date, status });
      });

      // sort history by date desc
      history.sort((a, b) => (a.date < b.date ? 1 : -1));

      const absentCount = Math.max(0, totalLectures - presentCount);
      const percentage = totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0;

      result.push({
        classId,
        subjectName: classData.subjectName,
        semester: classData.semester,
        semesterNumber: classData.semesterNumber,
        sections: classData.sections,
        teacherId: classData.teacherId,
        rollNo: csData.rollNo,
        section: csData.section,
        totalLectures,
        presentCount,
        absentCount,
        percentage,
        history
      });
    }

    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
