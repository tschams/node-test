import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAllSuppliers, getSupplierProducts, createOrder } from '../../services/api';

const OrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const preselectedSupplierId = queryParams.get('supplier');
  const preselectedProductId = queryParams.get('product');
  
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(preselectedSupplierId || '');
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(preselectedProductId || '');
  const [quantity, setQuantity] = useState(1);
  
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const response = await getAllSuppliers();
        setSuppliers(response.data.suppliers || []);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError('Failed to load suppliers. Please try again.');
      } finally {
        setLoadingSuppliers(false);
      }
    };
    
    fetchSuppliers();
  }, []);
  
  // Load supplier products when a supplier is selected
  useEffect(() => {
    const fetchSupplierProducts = async () => {
      if (!selectedSupplier) return;
      
      try {
        setLoadingProducts(true);
        setError('');
        const response = await getSupplierProducts(selectedSupplier);
        setSupplierProducts(response.data.products || []);
        
        // If a product was preselected via URL, set its minimum quantity
        if (preselectedProductId) {
          const preselectedProduct = response.data.products.find(p => p._id === preselectedProductId);
          if (preselectedProduct) {
            setQuantity(preselectedProduct.minimumPurchaseQuantity || 1);
          }
        }
      } catch (err) {
        console.error('Error fetching supplier products:', err);
        setError('Failed to load products for this supplier.');
        setSupplierProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    if (selectedSupplier) {
      fetchSupplierProducts();
    }
  }, [selectedSupplier, preselectedProductId]);
  
  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplier(supplierId);
    setSelectedProduct('');
    setQuantity(1);
    
    // Clear order items if changing supplier
    setOrderItems([]);
  };
  
  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    
    // Set default quantity to the minimum purchase quantity
    const product = supplierProducts.find(p => p._id === productId);
    if (product) {
      setQuantity(product.minimumPurchaseQuantity || 1);
    } else {
      setQuantity(1);
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value > 0 ? value : 1);
  };
  
  const handleAddToOrder = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const product = supplierProducts.find(p => p._id === selectedProduct);
    
    if (!product) return;
    
    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.product._id === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in order
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item to order
      setOrderItems([
        ...orderItems,
        {
          product,
          quantity,
          price: product.pricePerItem * quantity
        }
      ]);
    }
    
    // Reset selection
    setSelectedProduct('');
    setQuantity(1);
  };
  
  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };
  
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.price, 0);
  };
  
  const handleSubmitOrder = async () => {
    // Validate order
    if (orderItems.length === 0) {
      setError('Please add at least one product to your order.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const orderData = {
        supplier: selectedSupplier,
        items: orderItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          pricePerItem: item.product.pricePerItem
        }))
      };
      
      await createOrder(orderData);
      
      setSuccessMessage('Order placed successfully!');
      setOrderItems([]);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/store/orders');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const validateMinimumPurchase = (product, quantity) => {
    return quantity >= (product.minimumPurchaseQuantity || 1);
  };
  
  if (loadingSuppliers) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Place New Order
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1. Select Supplier
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="supplier-select-label">Supplier</InputLabel>
              <Select
                labelId="supplier-select-label"
                id="supplier-select"
                value={selectedSupplier}
                label="Supplier"
                onChange={handleSupplierChange}
                disabled={submitting}
              >
                <MenuItem value="">
                  <em>Select a supplier</em>
                </MenuItem>
                
                {suppliers.map(supplier => (
                  <MenuItem key={supplier._id} value={supplier._id}>
                    {supplier.companyName || supplier.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedSupplier && (
              <>
                <Typography variant="h6" gutterBottom>
                  2. Add Products
                </Typography>
                
                {loadingProducts ? (
                  <CircularProgress size={24} sx={{ mt: 2 }} />
                ) : (
                  supplierProducts.length === 0 ? (
                    <Alert severity="info">
                      No products available from this supplier.
                    </Alert>
                  ) : (
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id="product-select-label">Product</InputLabel>
                            <Select
                              labelId="product-select-label"
                              id="product-select"
                              value={selectedProduct}
                              label="Product"
                              onChange={handleProductChange}
                              disabled={submitting}
                            >
                              <MenuItem value="">
                                <em>Select a product</em>
                              </MenuItem>
                              
                              {supplierProducts.map(product => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name} - ${product.pricePerItem.toFixed(2)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            type="number"
                            label="Quantity"
                            fullWidth
                            value={quantity}
                            onChange={handleQuantityChange}
                            InputProps={{ inputProps: { min: 1 } }}
                            disabled={!selectedProduct || submitting}
                            helperText={selectedProduct ? 
                              `Min: ${supplierProducts.find(p => p._id === selectedProduct)?.minimumPurchaseQuantity || 1}` : 
                              ''}
                          />
                        </Grid>
                      </Grid>
                      
                      <Box textAlign="right" mt={2}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddToOrder}
                          disabled={!selectedProduct || submitting}
                        >
                          Add to Order
                        </Button>
                      </Box>
                    </Box>
                  )
                )}
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            {orderItems.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No items added to order yet.
              </Alert>
            ) : (
              <>
                <List>
                  {orderItems.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={item.product.name}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                ${item.product.pricePerItem.toFixed(2)} × {item.quantity} = ${item.price.toFixed(2)}
                              </Typography>
                              {!validateMinimumPurchase(item.product, item.quantity) && (
                                <Chip 
                                  size="small"
                                  color="error"
                                  label={`Below min qty (${item.product.minimumPurchaseQuantity})`}
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => handleRemoveItem(index)}
                            disabled={submitting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < orderItems.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/store/products')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitOrder}
                    disabled={orderItems.length === 0 || submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Place Order'}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderForm; 