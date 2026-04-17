const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

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
