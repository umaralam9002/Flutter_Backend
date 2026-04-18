const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.TEACHER));

router.put('/profile', teacherController.updateSelf);

// Class routes
router.post('/classes', teacherController.createClass);
router.get('/classes', teacherController.getMyClasses);

// Student verification
router.get('/verify-student', teacherController.verifyStudentEmail);

// Class Students routes
router.post('/classes/:classId/students', teacherController.addStudentToClass);
router.get('/classes/:classId/students', teacherController.getClassStudents);
router.delete('/classes/:classId/students/:studentId', teacherController.removeStudentFromClass);
// Attendance routes
router.post('/classes/:classId/attendance', teacherController.markAttendance);
router.post('/classes/:classId/attendance/mark-all', teacherController.markAllAttendance);
router.get('/classes/:classId/attendance', teacherController.getAttendanceByDate);
router.get('/classes/:classId/attendance-summary', teacherController.getStudentSummary);

module.exports = router;
