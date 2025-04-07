const Product = require('../models/Product');
const User = require('../models/User');

// Add a new product (supplier only)
const addProduct = async (req, res) => {
	try {
		const {
			name,
			pricePerItem,
			minimumPurchaseQuantity,
			currentStock,
			minimumStockThreshold,
		} = req.body;

		// Create new product
		const product = new Product({
			name,
			pricePerItem,
			minimumPurchaseQuantity,
			supplier: req.user._id,
			currentStock,
			minimumStockThreshold,
		});

		await product.save();

		// Add product to supplier's product list
		await User.findByIdAndUpdate(req.user._id, {
			$push: { productsOffered: product._id },
		});

		res.status(201).json({
			message: 'Product added successfully',
			product,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get all products
const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find().populate(
			'supplier',
			'companyName email phoneNumber'
		);

		res.json({ products });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get products from a specific supplier
const getSupplierProducts = async (req, res) => {
	try {
		const { supplierId } = req.params;

		const products = await Product.find({ supplier: supplierId }).populate(
			'supplier',
			'companyName email phoneNumber'
		);

		res.json({ products });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get my products (for logged in supplier)
const getMyProducts = async (req, res) => {
	try {
		const products = await Product.find({ supplier: req.user._id });

		res.json({ products });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get product by ID
const getProductById = async (req, res) => {
	try {
		const { productId } = req.params;

		const product = await Product.findById(productId).populate(
			'supplier',
			'companyName email phoneNumber'
		);

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		res.json({ product });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update product stock (for inventory management - bonus)
const updateProductStock = async (req, res) => {
	try {
		const { productId } = req.params;
		const { currentStock } = req.body;

		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		// Check if user is the supplier of this product or a store owner
		if (
			req.user.role === 'supplier' &&
			product.supplier.toString() !== req.user._id.toString()
		) {
			return res
				.status(403)
				.json({ message: 'Not authorized to update this product' });
		}

		product.currentStock = currentStock;
		await product.save();

		res.json({
			message: 'Product stock updated successfully',
			product,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

module.exports = {
	addProduct,
	getAllProducts,
	getSupplierProducts,
	getMyProducts,
	getProductById,
	updateProductStock,
};
