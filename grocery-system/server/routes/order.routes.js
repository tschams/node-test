const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { auth } = require('../middleware/auth');

// General order routes accessible to both suppliers and store owners
router.get('/:orderId', auth, orderController.getOrderById);

module.exports = router;
