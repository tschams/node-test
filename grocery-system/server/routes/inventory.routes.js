const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { auth, isStoreOwner } = require('../middleware/auth');

// Cash register API endpoint
router.post('/purchase', inventoryController.processPurchase);

// Inventory status (protected, only store owner)
router.get(
	'/status',
	auth,
	isStoreOwner,
	inventoryController.getInventoryStatus
);

module.exports = router;
