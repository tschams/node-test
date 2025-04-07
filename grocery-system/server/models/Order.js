const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	priceAtOrder: {
		type: Number,
		required: true,
		min: 0,
	},
});

const orderSchema = new mongoose.Schema({
	storeOwner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	supplier: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	items: [orderItemSchema],
	status: {
		type: String,
		enum: ['pending', 'in-progress', 'completed', 'cancelled'],
		default: 'pending',
	},
	totalPrice: {
		type: Number,
		required: true,
		min: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	// Timestamps for status changes
	statusHistory: [
		{
			status: {
				type: String,
				enum: ['pending', 'in-progress', 'completed', 'cancelled'],
			},
			timestamp: {
				type: Date,
				default: Date.now,
			},
		},
	],
});

// Update the updatedAt field before saving
orderSchema.pre('save', function (next) {
	this.updatedAt = Date.now();

	// Add status change to history if status has changed
	if (this.isModified('status')) {
		this.statusHistory.push({
			status: this.status,
			timestamp: Date.now(),
		});
	}

	next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
