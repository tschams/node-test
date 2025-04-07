const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { auth } = require('../middleware/auth');

// General product routes
router.get('/:productId', auth, productController.getProductById);

module.exports = router;
