const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

exports.updateSelf = async (req, res) => {
  try {
    const { password} = req.body;
    
    // if (name || email || role) {
    //   return res.status(400).json({ message: 'Students can only update passwords.' });
    // }

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
