const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const productController = require('../controllers/product.controller');
const orderController = require('../controllers/order.controller');
const { auth, isSupplier } = require('../middleware/auth');

// Auth routes
router.post('/register', (req, res) => {
	// Set role to supplier for this route
	req.body.role = 'supplier';
	authController.register(req, res);
});

router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, isSupplier, authController.getCurrentUser);

// Product routes
router.post('/products', auth, isSupplier, productController.addProduct);
router.get('/products', auth, isSupplier, productController.getMyProducts);

// Order routes
router.get('/orders', auth, isSupplier, orderController.getMyOrders);
router.get('/orders/:orderId', auth, isSupplier, orderController.getOrderById);
router.patch(
	'/orders/:orderId/status',
	auth,
	isSupplier,
	orderController.updateOrderStatus
);

module.exports = router;
