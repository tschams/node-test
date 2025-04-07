import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const register = (userData) => api.post(`/${userData.role === 'supplier' ? 'suppliers' : 'store'}/register`, userData);
export const login = (userData) => api.post(`/${userData.role === 'supplier' ? 'suppliers' : 'store'}/login`, userData);
export const getCurrentUser = (role) => api.get(`/${role === 'supplier' ? 'suppliers' : 'store'}/me`);

// Supplier API
export const addProduct = (productData) => api.post('/suppliers/products', productData);
export const getSupplierProducts = () => api.get('/suppliers/products');
export const getSupplierOrders = () => api.get('/suppliers/orders');
export const approveOrder = (orderId) => api.patch(`/suppliers/orders/${orderId}/status`, { status: 'in-progress' });

// Store Owner API
export const getAllProducts = () => api.get('/store/products');
export const getAllSuppliers = () => {
  // This is a workaround - we'll extract unique suppliers from the products list
  return getAllProducts().then(response => {
    const products = response.data.products || [];
    const uniqueSuppliers = [];
    const supplierMap = {};
    
    products.forEach(product => {
      if (product.supplier && !supplierMap[product.supplier._id]) {
        supplierMap[product.supplier._id] = true;
        uniqueSuppliers.push({
          _id: product.supplier._id,
          companyName: product.supplier.companyName || 'Unknown',
          email: product.supplier.email
        });
      }
    });
    
    return {
      data: {
        suppliers: uniqueSuppliers
      }
    };
  });
};
export const getSupplierProductsById = (supplierId) => api.get(`/store/suppliers/${supplierId}/products`);
export const getStoreOrders = () => api.get('/store/orders');
export const createOrder = (orderData) => api.post('/store/orders', orderData);
export const confirmOrderReceipt = (orderId) => api.patch(`/store/orders/${orderId}/status`, { status: 'completed' });
export const updateOrderStatus = (orderId, statusData) => api.patch(`/store/orders/${orderId}/status`, statusData);
export const getInventoryStatus = () => api.get('/store/inventory');

// General API
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);
export const getProductById = (productId) => api.get(`/products/${productId}`);

// Cash Register API
export const processPurchase = (purchaseData) => api.post('/inventory/purchase', purchaseData);

export default api; 