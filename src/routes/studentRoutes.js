const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.STUDENT));

// Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateSelf);

// Classes & Attendance
router.get('/classes', studentController.getMyClasses);
router.get('/attendance', studentController.getAllAttendance);

module.exports = router;
