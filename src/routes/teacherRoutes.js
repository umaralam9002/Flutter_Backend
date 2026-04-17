const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.TEACHER));

router.put('/profile', teacherController.updateSelf);

module.exports = router;
