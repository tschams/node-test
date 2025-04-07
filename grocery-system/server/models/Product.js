const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	pricePerItem: {
		type: Number,
		required: true,
		min: 0,
	},
	minimumPurchaseQuantity: {
		type: Number,
		required: true,
		min: 1,
		default: 1,
	},
	supplier: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	// For inventory management (bonus section)
	currentStock: {
		type: Number,
		default: 0,
		min: 0,
	},
	minimumStockThreshold: {
		type: Number,
		default: 0,
		min: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
