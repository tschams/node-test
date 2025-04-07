import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
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
  Chip,
  CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getAllSuppliers, getSupplierProductsById, createOrder } from '../../services/api';

const OrderForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const preselectedSupplierId = queryParams.get('supplier');
  const preselectedProductId = queryParams.get('product');
  
  // State for stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Supplier', 'Add Products', 'Review & Submit'];
  
  // Order data
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(preselectedSupplierId || '');
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(preselectedProductId || '');
  const [quantity, setQuantity] = useState(1);
  
  // UI states
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
        setError('');
        const response = await getAllSuppliers();
        
        if (!response.data.suppliers || response.data.suppliers.length === 0) {
          setError('No suppliers found. Please contact your administrator or add suppliers to your system.');
          setSuppliers([]);
          return;
        }
        
        setSuppliers(response.data.suppliers || []);
        
        // If supplier is preselected, move to next step
        if (preselectedSupplierId) {
          const supplierExists = response.data.suppliers.some(s => s._id === preselectedSupplierId);
          if (supplierExists) {
            setActiveStep(1);
          } else {
            setError('Selected supplier not found. Please select another supplier.');
            setSelectedSupplier('');
          }
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError('Failed to load suppliers. This could be because there are no products in the system yet. Please ensure products have been added by suppliers.');
      } finally {
        setLoadingSuppliers(false);
      }
    };
    
    fetchSuppliers();
  }, [preselectedSupplierId]);
  
  // Load supplier products when a supplier is selected
  useEffect(() => {
    const fetchSupplierProducts = async () => {
      if (!selectedSupplier) return;
      
      try {
        setLoadingProducts(true);
        setError('');
        const response = await getSupplierProductsById(selectedSupplier);
        
        if (!response.data.products || response.data.products.length === 0) {
          setSupplierProducts([]);
          setError('No products available from this supplier. Please select another supplier or contact them to add products.');
          return;
        }
        
        setSupplierProducts(response.data.products || []);
        
        // If a product was preselected via URL, set its minimum quantity
        if (preselectedProductId) {
          const preselectedProduct = response.data.products.find(p => p._id === preselectedProductId);
          if (preselectedProduct) {
            setQuantity(preselectedProduct.minimumPurchaseQuantity || 1);
            
            // Add preselected product to order
            handleAddToOrder(preselectedProduct._id, preselectedProduct.minimumPurchaseQuantity || 1);
          } else {
            setError('Selected product not found. Please choose another product.');
          }
        }
      } catch (err) {
        console.error('Error fetching supplier products:', err);
        setError('Failed to load products for this supplier. Please try again or select another supplier.');
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
  
  const handleAddToOrder = (productId = selectedProduct, productQuantity = quantity) => {
    if (!productId || productQuantity <= 0) return;
    
    const product = supplierProducts.find(p => p._id === productId);
    
    if (!product) return;
    
    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.product._id === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in order
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += productQuantity;
      updatedItems[existingItemIndex].price = updatedItems[existingItemIndex].quantity * product.pricePerItem;
      setOrderItems(updatedItems);
    } else {
      // Add new item to order
      setOrderItems([
        ...orderItems,
        {
          product,
          quantity: productQuantity,
          price: product.pricePerItem * productQuantity
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
      setActiveStep(3); // Move to success step
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/store/orders');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };
  
  const validateMinimumPurchase = (product, quantity) => {
    return quantity >= (product.minimumPurchaseQuantity || 1);
  };
  
  const handleNext = () => {
    // Validation for each step
    if (activeStep === 0 && !selectedSupplier) {
      setError('Please select a supplier to continue.');
      return;
    }
    
    if (activeStep === 1 && orderItems.length === 0) {
      setError('Please add at least one product to continue.');
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };
  
  if (loadingSuppliers && activeStep === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // No suppliers in the system
  if (!loadingSuppliers && suppliers.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="div">
            Store Order Form
          </Typography>
          <ShoppingCartIcon sx={{ ml: 2, fontSize: 30 }} />
        </Box>
        
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            No Suppliers Available
          </Typography>
          <Typography variant="body1" paragraph>
            There are no suppliers with products in the system. 
            Before you can place orders, suppliers need to be added to the system and they need to add products.
          </Typography>
          <Typography variant="body1" paragraph>
            Please contact your system administrator to ensure suppliers are set up.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/store/dashboard')}
            sx={{ mt: 2 }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Select Supplier
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select a Supplier
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose a supplier to view their products and place an order.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="supplier-select-label">Supplier</InputLabel>
              <Select
                labelId="supplier-select-label"
                id="supplier-select"
                value={selectedSupplier}
                label="Supplier"
                onChange={handleSupplierChange}
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
            
            {suppliers.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Suppliers ({suppliers.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {suppliers.map(supplier => (
                    <Grid item xs={12} sm={6} md={4} key={supplier._id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedSupplier === supplier._id ? '2px solid' : '1px solid',
                          borderColor: selectedSupplier === supplier._id ? 'primary.main' : 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: 1
                          }
                        }}
                        onClick={() => setSelectedSupplier(supplier._id)}
                      >
                        <CardContent>
                          <Typography variant="h6" component="div" gutterBottom>
                            {supplier.companyName || 'Unknown Company'}
                          </Typography>
                          {supplier.email && (
                            <Typography variant="body2" color="text.secondary">
                              {supplier.email}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSupplier(supplier._id);
                              handleNext();
                            }}
                          >
                            Select and Continue
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        );
        
      case 1: // Add Products
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add Products from {suppliers.find(s => s._id === selectedSupplier)?.companyName || 'Supplier'}
            </Typography>
            
            {loadingProducts ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              supplierProducts.length === 0 ? (
                <Alert severity="info">
                  No products available from this supplier.
                </Alert>
              ) : (
                <Box>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="product-select-label">Product</InputLabel>
                        <Select
                          labelId="product-select-label"
                          id="product-select"
                          value={selectedProduct}
                          label="Product"
                          onChange={handleProductChange}
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
                        disabled={!selectedProduct}
                        helperText={selectedProduct ? 
                          `Min: ${supplierProducts.find(p => p._id === selectedProduct)?.minimumPurchaseQuantity || 1}` : 
                          ''}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box textAlign="right">
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddToOrder()}
                      disabled={!selectedProduct}
                      sx={{ mb: 3 }}
                    >
                      Add to Order
                    </Button>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Items in Cart ({orderItems.length})
                  </Typography>
                  
                  {orderItems.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No items added to order yet.
                    </Alert>
                  ) : (
                    <List>
                      {orderItems.map((item, index) => (
                        <ListItem key={index} divider={index < orderItems.length - 1}>
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
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )
            )}
          </Paper>
        );
        
      case 2: // Review & Submit
        return (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Order
            </Typography>
            
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Supplier
              </Typography>
              <Typography variant="body1">
                {suppliers.find(s => s._id === selectedSupplier)?.companyName || 'Unknown Supplier'}
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Order Items
            </Typography>
            
            <List sx={{ mb: 3 }}>
              {orderItems.map((item, index) => (
                <ListItem key={index} divider={index < orderItems.length - 1}>
                  <ListItemText
                    primary={`${item.quantity}x ${item.product.name}`}
                    secondary={`$${item.product.pricePerItem.toFixed(2)} each`}
                  />
                  <Typography variant="body1">
                    ${item.price.toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
              
              <ListItem>
                <ListItemText
                  primary={<Typography variant="h6">Total</Typography>}
                />
                <Typography variant="h6">
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </ListItem>
            </List>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Once submitted, your order will be sent to the supplier for approval.
            </Alert>
          </Paper>
        );
        
      case 3: // Success
        return (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              Your order has been submitted to the supplier.
            </Typography>
            <Typography variant="body1" paragraph>
              You'll be redirected to your orders page...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </Paper>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="div">
          Store Order Form
        </Typography>
        <ShoppingCartIcon sx={{ ml: 2, fontSize: 30 }} />
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'info.lighter' }}>
        <Typography variant="body1">
          As a store owner, you can place orders with your suppliers using this form.
          Orders will be sent to suppliers for approval before being processed.
        </Typography>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && activeStep !== 3 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent(activeStep)}
      
      {activeStep < 3 && (
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/store/products') : handleBack}
            disabled={submitting}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          {activeStep === 2 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitOrder}
              disabled={orderItems.length === 0 || submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Place Order'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !selectedSupplier) ||
                (activeStep === 1 && orderItems.length === 0) ||
                submitting
              }
            >
              Next
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
};

export default OrderForm; 