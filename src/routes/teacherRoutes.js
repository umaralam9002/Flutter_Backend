const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { teacherDashboard } = require('../controllers/teacherController');

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('teacher'),
  teacherDashboard
);

module.exports = router;