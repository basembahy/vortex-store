const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All admin routes require verifyToken + requireAdmin
router.use(verifyToken, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.post('/users/admin', adminController.createAdminUser);

module.exports = router;
