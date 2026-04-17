const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { adminDashboard } = require('../controllers/adminController');

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('admin'),
  adminDashboard
);

module.exports = router;