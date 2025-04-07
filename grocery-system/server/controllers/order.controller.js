const Order = require('../models/Order');
const Product = require('../models/Product');

// Create a new order (store owner only)
const createOrder = async (req, res) => {
	try {
		const { supplierId, items } = req.body;

		if (!items || items.length === 0) {
			return res
				.status(400)
				.json({ message: 'Order must contain at least one item' });
		}

		// Calculate total price and validate items
		const orderItems = [];
		let totalPrice = 0;

		// Validate each item
		for (const item of items) {
			const product = await Product.findById(item.productId);

			if (!product) {
				return res
					.status(404)
					.json({ message: `Product with ID ${item.productId} not found` });
			}

			if (product.supplier.toString() !== supplierId) {
				return res
					.status(400)
					.json({
						message: `Product ${product.name} does not belong to the specified supplier`,
					});
			}

			if (item.quantity < product.minimumPurchaseQuantity) {
				return res.status(400).json({
					message: `Quantity for ${product.name} is less than minimum purchase quantity (${product.minimumPurchaseQuantity})`,
				});
			}

			const itemTotalPrice = product.pricePerItem * item.quantity;
			totalPrice += itemTotalPrice;

			orderItems.push({
				product: product._id,
				quantity: item.quantity,
				priceAtOrder: product.pricePerItem,
			});
		}

		// Create order
		const order = new Order({
			storeOwner: req.user._id,
			supplier: supplierId,
			items: orderItems,
			totalPrice,
			status: 'pending',
			statusHistory: [{ status: 'pending' }],
		});

		await order.save();

		res.status(201).json({
			message: 'Order created successfully',
			order,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get all orders for the authenticated user
const getMyOrders = async (req, res) => {
	try {
		let orders;

		// If supplier, get orders where user is the supplier
		if (req.user.role === 'supplier') {
			orders = await Order.find({ supplier: req.user._id })
				.populate('storeOwner', 'email')
				.populate({
					path: 'items.product',
					select: 'name pricePerItem minimumPurchaseQuantity',
				});
		}
		// If store owner, get orders where user is the store owner
		else if (req.user.role === 'storeOwner') {
			orders = await Order.find({ storeOwner: req.user._id })
				.populate('supplier', 'companyName email phoneNumber')
				.populate({
					path: 'items.product',
					select: 'name pricePerItem minimumPurchaseQuantity',
				});
		}

		res.json({ orders });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get order by ID
const getOrderById = async (req, res) => {
	try {
		const { orderId } = req.params;

		const order = await Order.findById(orderId)
			.populate('supplier', 'companyName email phoneNumber')
			.populate('storeOwner', 'email')
			.populate({
				path: 'items.product',
				select: 'name pricePerItem minimumPurchaseQuantity',
			});

		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		// Check if user is authorized to view this order
		if (
			order.supplier.toString() !== req.user._id.toString() &&
			order.storeOwner.toString() !== req.user._id.toString()
		) {
			return res
				.status(403)
				.json({ message: 'Not authorized to view this order' });
		}

		res.json({ order });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update order status
const updateOrderStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { status } = req.body;

		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		// Validate status change based on user role and current status
		if (req.user.role === 'supplier') {
			// Supplier can only change status from 'pending' to 'in-progress'
			if (order.supplier.toString() !== req.user._id.toString()) {
				return res
					.status(403)
					.json({ message: 'Not authorized to update this order' });
			}

			if (order.status !== 'pending' || status !== 'in-progress') {
				return res
					.status(400)
					.json({
						message:
							'Supplier can only approve pending orders (change to in-progress)',
					});
			}
		} else if (req.user.role === 'storeOwner') {
			// Store owner can only change status from 'in-progress' to 'completed'
			if (order.storeOwner.toString() !== req.user._id.toString()) {
				return res
					.status(403)
					.json({ message: 'Not authorized to update this order' });
			}

			if (order.status !== 'in-progress' || status !== 'completed') {
				return res
					.status(400)
					.json({
						message:
							'Store owner can only confirm receipt of in-progress orders (change to completed)',
					});
			}

			// Update inventory for completed orders (bonus feature)
			for (const item of order.items) {
				const product = await Product.findById(item.product);
				if (product) {
					product.currentStock += item.quantity;
					await product.save();
				}
			}
		}

		// Update order status
		order.status = status;
		await order.save();

		res.json({
			message: 'Order status updated successfully',
			order,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

module.exports = {
	createOrder,
	getMyOrders,
	getOrderById,
	updateOrderStatus,
};
