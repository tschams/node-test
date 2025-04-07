const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const productController = require('../controllers/product.controller');
const orderController = require('../controllers/order.controller');
const inventoryController = require('../controllers/inventory.controller');
const { auth, isStoreOwner } = require('../middleware/auth');

// Auth routes
router.post('/register', (req, res) => {
	// Set role to storeOwner for this route
	req.body.role = 'storeOwner';
	authController.register(req, res);
});

router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, isStoreOwner, authController.getCurrentUser);

// Product routes
router.get('/products', auth, isStoreOwner, productController.getAllProducts);
router.get(
	'/products/:productId',
	auth,
	isStoreOwner,
	productController.getProductById
);
router.get(
	'/suppliers/:supplierId/products',
	auth,
	isStoreOwner,
	productController.getSupplierProducts
);

// Order routes
router.post('/orders', auth, isStoreOwner, orderController.createOrder);
router.get('/orders', auth, isStoreOwner, orderController.getMyOrders);
router.get(
	'/orders/:orderId',
	auth,
	isStoreOwner,
	orderController.getOrderById
);
router.patch(
	'/orders/:orderId/status',
	auth,
	isStoreOwner,
	orderController.updateOrderStatus
);

// Inventory routes (bonus feature)
router.get(
	'/inventory',
	auth,
	isStoreOwner,
	inventoryController.getInventoryStatus
);

module.exports = router;
