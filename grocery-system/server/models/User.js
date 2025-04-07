const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ['supplier', 'storeOwner'],
		required: true,
	},
	// Fields specific to suppliers
	companyName: {
		type: String,
		required: function () {
			return this.role === 'supplier';
		},
	},
	phoneNumber: {
		type: String,
		required: function () {
			return this.role === 'supplier';
		},
	},
	representativeName: {
		type: String,
		required: function () {
			return this.role === 'supplier';
		},
	},
	productsOffered: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
