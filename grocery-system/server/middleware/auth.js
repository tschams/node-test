const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
	try {
		// Get token from header
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return res
				.status(401)
				.json({ message: 'Authentication failed. No token provided.' });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

		// Find user
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res
				.status(401)
				.json({ message: 'Authentication failed. User not found.' });
		}

		// Add user to request object
		req.user = user;
		req.token = token;

		next();
	} catch (error) {
		res.status(401).json({ message: 'Authentication failed. Invalid token.' });
	}
};

// Middleware to check if user is a supplier
const isSupplier = (req, res, next) => {
	if (req.user && req.user.role === 'supplier') {
		next();
	} else {
		res.status(403).json({ message: 'Access denied. Supplier role required.' });
	}
};

// Middleware to check if user is a store owner
const isStoreOwner = (req, res, next) => {
	if (req.user && req.user.role === 'storeOwner') {
		next();
	} else {
		res
			.status(403)
			.json({ message: 'Access denied. Store owner role required.' });
	}
};

module.exports = { auth, isSupplier, isStoreOwner };
