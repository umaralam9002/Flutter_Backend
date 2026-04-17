const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const ROLES = require('../constants/roles');

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.get('/users/email/:email', adminController.getUserByEmail);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
