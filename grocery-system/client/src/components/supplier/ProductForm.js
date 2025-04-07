import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  InputAdornment,
  Alert
} from '@mui/material';
import { addProduct } from '../../services/api';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    pricePerItem: '',
    minimumPurchaseQuantity: 1,
    currentStock: 0,
    minimumStockThreshold: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric fields to numbers
    const numericFields = ['pricePerItem', 'minimumPurchaseQuantity', 'currentStock', 'minimumStockThreshold'];
    const parsedValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    
    if (formData.pricePerItem <= 0) {
      setError('Price must be greater than zero');
      return;
    }
    
    if (formData.minimumPurchaseQuantity < 1) {
      setError('Minimum purchase quantity must be at least 1');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await addProduct(formData);
      
      setSuccess('Product added successfully');
      
      // Reset form
      setFormData({
        name: '',
        pricePerItem: '',
        minimumPurchaseQuantity: 1,
        currentStock: 0,
        minimumStockThreshold: 0
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/supplier/products');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Add New Product
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add a new product to your inventory that store owners can purchase.
        </Typography>
      </Box>
      
      <Paper elevation={3}>
        <Box p={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Price Per Item"
                  name="pricePerItem"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={formData.pricePerItem}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Minimum Purchase Quantity"
                  name="minimumPurchaseQuantity"
                  type="number"
                  value={formData.minimumPurchaseQuantity}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                  helperText="Minimum quantity store owners must purchase"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Inventory Management (Optional)
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Stock"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                  helperText="Current inventory level"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Stock Threshold"
                  name="minimumStockThreshold"
                  type="number"
                  value={formData.minimumStockThreshold}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                  helperText="Stock level that triggers automatic reordering"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/supplier/products')}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Product'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductForm; 