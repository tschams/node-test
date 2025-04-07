const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const supplierRoutes = require('./routes/supplier.routes');
const storeOwnerRoutes = require('./routes/storeOwner.routes');
const orderRoutes = require('./routes/order.routes');
const productRoutes = require('./routes/product.routes');
const inventoryRoutes = require('./routes/inventory.routes');

// Use routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/store', storeOwnerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-store')
	.then(() => {
		console.log('Connected to MongoDB');
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err);
	});

// Default route
app.get('/', (req, res) => {
	res.send('Grocery Store Management API');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
