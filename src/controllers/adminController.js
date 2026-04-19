const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const ROLES = require('../constants/roles');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!role) return res.status(400).json({ message: 'Role is required.' });

    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) return res.status(400).json({ message: 'Email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
      name, 
      email, 
      password: hashedPassword, 
      role, 
      createdAt: new Date().toISOString() 
    };
    
    const docRef = await db.collection('users').add(newUser);
    res.status(201).json({ message: 'User created successfully', userId: docRef.id, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found.' });
    
    const userData = doc.data();
    delete userData.password;
    res.status(200).json({ id: doc.id, ...userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('email', '==', req.params.email).get();
    if (snapshot.empty) return res.status(404).json({ message: 'User not found.' });
    
    const doc = snapshot.docs[0];
    const userData = doc.data();
    delete userData.password;
    res.status(200).json({ id: doc.id, ...userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const userRef = db.collection('users').doc(req.params.id);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found' });

    await userRef.update(updateData);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found' });

    await userRef.delete();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 1. Get Dashboard Statistics (Total Students, Teachers, Admins, Users)
exports.getDashboardStats = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    
    let totalStudents = 0;
    let totalTeachers = 0;
    let totalAdmins = 0;
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.role === ROLES.STUDENT) totalStudents++;
      else if (user.role === ROLES.TEACHER) totalTeachers++;
      else if (user.role === ROLES.ADMIN) totalAdmins++;
    });

    const totalUsers = totalStudents + totalTeachers + totalAdmins;

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get Recent Registrations
exports.getRecentRegistrations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Fetch newly created users, specifically those typically shown in the table
    const recentUsersSnapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
      
    const recentRegistrations = recentUsersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
      };
    });

    res.status(200).json({ recentRegistrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Classes Overview
exports.getClassesOverview = async (req, res) => {
  try {
    // Get all classes
    const classesSnapshot = await db.collection('classes')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const classesOverview = await Promise.all(classesSnapshot.docs.map(async (classDoc) => {
      const classData = classDoc.data();
      
      // Fetch teacher details associated with the class
      let teacherName = 'Unknown Teacher';
      if (classData.teacherId) {
        const teacherDoc = await db.collection('users').doc(classData.teacherId).get();
        if (teacherDoc.exists) teacherName = teacherDoc.data().name;
      }
      
      // Look up enrolled students length from 'class_students' collection
      let studentsCount = 0;
      try {
        const studentsSnapshot = await db.collection('class_students')
          .where('classId', '==', classDoc.id)
          .get();
        studentsCount = studentsSnapshot.size;
      } catch (err) {
        console.error("Error fetching students count:", err);
      }

      // Format class name based on how teacher creates it (e.g. "Semester 1 - Fall 2023")
      const className = classData.semesterNumber && classData.semester 
        ? `Semester ${classData.semesterNumber} - ${classData.semester}` 
        : (classData.subjectName || classData.name || classData.className || 'Unknown Class');

      // Sections might come as an array or a string from teacher controller
      let section = 'N/A';
      if (classData.sections) {
        section = Array.isArray(classData.sections) ? classData.sections.join(', ') : classData.sections;
      } else if (classData.section) {
        section = classData.section;
      }

      return {
        id: classDoc.id,
        className,
        section, 
        teacherName: teacherName,
        studentsCount
      };
    }));

    res.status(200).json({ classesOverview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
