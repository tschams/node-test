const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Process cash register update
const processPurchase = async (req, res) => {
	try {
		const { items } = req.body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ message: 'Invalid purchase data' });
		}

		const productsToOrder = [];
		const updatedProducts = [];

		// Process each purchased item
		for (const item of items) {
			const { productId, quantity } = item;

			const product = await Product.findById(productId);

			if (!product) {
				continue; // Skip unknown products
			}

			// Update stock
			product.currentStock = Math.max(0, product.currentStock - quantity);

			// Check if we need to reorder
			if (product.currentStock < product.minimumStockThreshold) {
				productsToOrder.push(product);
			}

			await product.save();
			updatedProducts.push(product);
		}

		// Process auto-orders if needed
		const autoOrders = await processAutoOrders(productsToOrder);

		res.json({
			message: 'Purchase processed successfully',
			updatedProducts,
			autoOrders,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Helper function to create automatic orders
const processAutoOrders = async (productsToOrder) => {
	if (!productsToOrder.length) return [];

	const autoOrders = [];
	const supplierOrders = {};

	// Group products by supplier
	for (const product of productsToOrder) {
		const supplierId = product.supplier.toString();

		if (!supplierOrders[supplierId]) {
			supplierOrders[supplierId] = [];
		}

		supplierOrders[supplierId].push({
			productId: product._id,
			quantity: Math.max(
				product.minimumPurchaseQuantity,
				product.minimumStockThreshold - product.currentStock
			),
		});
	}

	// Find a store owner to place orders
	const storeOwner = await User.findOne({ role: 'storeOwner' });

	if (!storeOwner) {
		throw new Error('No store owner found to place automatic orders');
	}

	// Create orders for each supplier
	for (const supplierId in supplierOrders) {
		const items = supplierOrders[supplierId];
		const orderItems = [];
		let totalPrice = 0;

		// Process each item in the order
		for (const item of items) {
			const product = await Product.findById(item.productId);

			const itemTotalPrice = product.pricePerItem * item.quantity;
			totalPrice += itemTotalPrice;

			orderItems.push({
				product: product._id,
				quantity: item.quantity,
				priceAtOrder: product.pricePerItem,
			});
		}

		// Create the order
		const order = new Order({
			storeOwner: storeOwner._id,
			supplier: supplierId,
			items: orderItems,
			totalPrice,
			status: 'pending',
			statusHistory: [{ status: 'pending' }],
		});

		await order.save();
		autoOrders.push(order);
	}

	return autoOrders;
};

// Get inventory status
const getInventoryStatus = async (req, res) => {
	try {
		const products = await Product.find().populate(
			'supplier',
			'companyName email phoneNumber'
		);

		// Group products by current stock status
		const lowStock = products.filter(
			(p) => p.currentStock < p.minimumStockThreshold
		);
		const inStock = products.filter(
			(p) => p.currentStock >= p.minimumStockThreshold
		);

		res.json({
			totalProducts: products.length,
			lowStock,
			inStock,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

module.exports = {
	processPurchase,
	getInventoryStatus,
};
