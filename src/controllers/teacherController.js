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
