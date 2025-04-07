# Grocery Store Management System

A complete system to help grocery store owners manage their inventory, orders, and supplier relationships.

## Features

### Client Side – Supplier Login
- Register a new user to the system / Login for existing user
- View orders placed by the store owner
- Approve an order – An approved order will change its status to "In Progress".

### Server Side – Store Owner Login
- Order goods from a supplier
- View the status of existing orders
- Confirm receipt of an order – It will change to the status "Completed" and notify the supplier that the order was received
- Database of all orders (including those marked as completed)

### Bonus Section – Goods Management and Automatic Ordering
- Automatic inventory management
- Integration with cash register
- Automatic ordering when stock is low

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB

### Setup

1. Clone the repository
```
git clone <repository-url>
cd grocery-system
```

2. Install dependencies for the server
```
cd server
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grocery-store
JWT_SECRET=your_jwt_secret_key
```

4. Start the MongoDB server (make sure MongoDB is installed and running)

5. Start the server
```
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/suppliers/register` - Register a new supplier
- `POST /api/suppliers/login` - Login as a supplier
- `POST /api/store/register` - Register as a store owner
- `POST /api/store/login` - Login as a store owner

### Products
- `POST /api/suppliers/products` - Add a new product (supplier only)
- `GET /api/suppliers/products` - Get all products of the logged-in supplier
- `GET /api/store/products` - Get all products (store owner only)
- `GET /api/products/:productId` - Get a specific product

### Orders
- `POST /api/store/orders` - Create a new order (store owner only)
- `GET /api/suppliers/orders` - Get all orders for the logged-in supplier
- `GET /api/store/orders` - Get all orders for the store owner
- `GET /api/orders/:orderId` - Get a specific order
- `PATCH /api/suppliers/orders/:orderId/status` - Update order status (supplier)
- `PATCH /api/store/orders/:orderId/status` - Update order status (store owner)

### Inventory (Bonus)
- `POST /api/inventory/purchase` - Process a purchase from the cash register
- `GET /api/store/inventory` - Get inventory status (store owner only)

## Data Models

### User
- Email (String, required, unique)
- Password (String, required)
- Role (String, enum: ['supplier', 'storeOwner'])
- Company Name (String, required for suppliers)
- Phone Number (String, required for suppliers)
- Representative Name (String, required for suppliers)
- Products Offered (Array of Product IDs, for suppliers)

### Product
- Name (String, required)
- Price Per Item (Number, required)
- Minimum Purchase Quantity (Number, required)
- Supplier (Reference to User)
- Current Stock (Number, for inventory management)
- Minimum Stock Threshold (Number, for auto-ordering)

### Order
- Store Owner (Reference to User)
- Supplier (Reference to User)
- Items (Array of OrderItems)
- Status (String, enum: ['pending', 'in-progress', 'completed', 'cancelled'])
- Total Price (Number)
- Created At (Date)
- Updated At (Date)
- Status History (Array of status changes with timestamps)

### Order Item
- Product (Reference to Product)
- Quantity (Number)
- Price At Order (Number)

## License
ISC 