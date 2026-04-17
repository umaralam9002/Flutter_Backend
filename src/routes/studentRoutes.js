const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.STUDENT));

router.put('/profile', studentController.updateSelf);

module.exports = router;
