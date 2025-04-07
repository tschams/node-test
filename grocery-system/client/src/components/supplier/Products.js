import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getSupplierProducts } from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getSupplierProducts();
        setProducts(response.data.products);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Function to check if product is low on stock
  const isLowStock = (product) => {
    return product.currentStock < product.minimumStockThreshold;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Products Management
        </Typography>
        
        <Button
          component={Link}
          to="/supplier/products/add"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add New Product
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {products.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            You haven't added any products yet.
          </Typography>
          <Button
            component={Link}
            to="/supplier/products/add"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add Your First Product
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Min. Purchase Qty</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Stock Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell component="th" scope="row">
                    {product.name}
                  </TableCell>
                  <TableCell align="right">${product.pricePerItem.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.minimumPurchaseQuantity}</TableCell>
                  <TableCell align="right">{product.currentStock}</TableCell>
                  <TableCell align="right">
                    {product.minimumStockThreshold > 0 ? (
                      <Chip
                        label={isLowStock(product) ? "Low Stock" : "In Stock"}
                        color={isLowStock(product) ? "warning" : "success"}
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="No Tracking" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Floating action button for mobile */}
      <Box sx={{ display: { md: 'none' }, position: 'fixed', bottom: 20, right: 20 }}>
        <Fab
          color="primary"
          component={Link}
          to="/supplier/products/add"
          aria-label="add product"
        >
          <AddIcon />
        </Fab>
      </Box>
    </Container>
  );
};

export default Products; 