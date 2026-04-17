const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const ROLES = require('../constants/roles');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Force role to STUDENT
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: ROLES.STUDENT,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').add(newUser);

    res.status(201).json({ message: 'Student registered successfully', user: { id: docRef.id, email, role: ROLES.STUDENT } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'Invalid email or password.' });
    }

    const userData = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: userId, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token, role: userData.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
