const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_key', {
		expiresIn: '7d',
	});
};

// Register a new user (supplier or store owner)
const register = async (req, res) => {
	try {
		const {
			email,
			password,
			role,
			companyName,
			phoneNumber,
			representativeName,
		} = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(400)
				.json({ message: 'User already exists with this email' });
		}

		// Create new user
		const user = new User({
			email,
			password,
			role,
			companyName,
			phoneNumber,
			representativeName,
			productsOffered: [],
		});

		await user.save();

		// Generate token
		const token = generateToken(user._id);

		res.status(201).json({
			message: 'User registered successfully',
			token,
			user: {
				id: user._id,
				email: user.email,
				role: user.role,
				companyName: user.companyName,
				representativeName: user.representativeName,
			},
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Login user
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Generate token
		const token = generateToken(user._id);

		res.json({
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				email: user.email,
				role: user.role,
				companyName: user.companyName,
				representativeName: user.representativeName,
			},
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get current user
const getCurrentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({ user });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

module.exports = {
	register,
	login,
	getCurrentUser,
};
