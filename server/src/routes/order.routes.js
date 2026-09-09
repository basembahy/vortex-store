const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, optionalToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Customer / Public routes
router.post('/', optionalToken, upload.single('receipt'), orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/:id', optionalToken, orderController.getOrderById);

// Admin routes
router.get('/admin/all', verifyToken, requireAdmin, orderController.adminGetOrders);
router.patch('/admin/:id/status', verifyToken, requireAdmin, orderController.adminUpdateOrderStatus);
router.post('/admin/:id/fulfill', verifyToken, requireAdmin, orderController.adminFulfillOrder);

module.exports = router;
