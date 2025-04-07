import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Context
import { AuthProvider } from './context/AuthContext';

// Shared Components
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Public Pages
import Home from './components/Home';

// Supplier Pages
import SupplierDashboard from './components/supplier/Dashboard';
import SupplierOrders from './components/supplier/Orders';

// Store Owner Pages (we'll add these later)
// import StoreOwnerDashboard from './components/storeOwner/Dashboard';
// import StoreOwnerOrders from './components/storeOwner/Orders';
// import StoreOwnerProducts from './components/storeOwner/Products';
// import StoreOwnerInventory from './components/storeOwner/Inventory';

// Error Pages
const NotFound = () => <div>404 - Page Not Found</div>;
const Unauthorized = () => <div>Unauthorized - You don't have access to this page</div>;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Supplier Routes */}
            <Route element={<ProtectedRoute role="supplier" />}>
              <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
              <Route path="/supplier/orders" element={<SupplierOrders />} />
              {/* Add more supplier routes as needed */}
            </Route>
            
            {/* Store Owner Routes */}
            <Route element={<ProtectedRoute role="storeOwner" />}>
              {/* 
                <Route path="/store/dashboard" element={<StoreOwnerDashboard />} />
                <Route path="/store/orders" element={<StoreOwnerOrders />} />
                <Route path="/store/products" element={<StoreOwnerProducts />} />
                <Route path="/store/inventory" element={<StoreOwnerInventory />} />
              */}
              {/* Temporary redirects until we implement store owner components */}
              <Route path="/store/dashboard" element={<div>Store Owner Dashboard - Coming Soon</div>} />
              <Route path="/store/orders" element={<div>Store Owner Orders - Coming Soon</div>} />
              <Route path="/store/products" element={<div>Store Owner Products - Coming Soon</div>} />
              <Route path="/store/inventory" element={<div>Store Owner Inventory - Coming Soon</div>} />
            </Route>
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
