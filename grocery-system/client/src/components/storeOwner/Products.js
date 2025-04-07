import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getAllProducts } from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [suppliers, setSuppliers] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        const productsList = response.data.products || [];
        setProducts(productsList);
        
        // Extract unique suppliers for filtering
        const uniqueSuppliers = [];
        const supplierMap = {};
        
        productsList.forEach(product => {
          if (product.supplier && !supplierMap[product.supplier._id]) {
            supplierMap[product.supplier._id] = true;
            uniqueSuppliers.push({
              id: product.supplier._id,
              name: product.supplier.companyName || product.supplier.email
            });
          }
        });
        
        setSuppliers(uniqueSuppliers);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSupplierFilterChange = (e) => {
    setSupplierFilter(e.target.value);
  };
  
  // Filter products based on search term and supplier filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = supplierFilter === 'all' || 
      (product.supplier && product.supplier._id === supplierFilter);
    
    return matchesSearch && matchesSupplier;
  });
  
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
          Available Products
        </Typography>
        
        <Button
          component={Link}
          to="/store/orders/new"
          variant="contained"
          color="primary"
        >
          Place Order
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search Products"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="supplier-filter-label">Supplier</InputLabel>
              <Select
                labelId="supplier-filter-label"
                id="supplier-filter"
                value={supplierFilter}
                label="Supplier"
                onChange={handleSupplierFilterChange}
              >
                <MenuItem value="all">All Suppliers</MenuItem>
                
                {suppliers.map(supplier => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            No products found matching your criteria.
          </Typography>
        </Paper>
      ) : (
        <Box mb={4}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Found {filteredProducts.length} products
          </Typography>
          
          <Grid container spacing={3}>
            {filteredProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Supplier: {product.supplier?.companyName || 'Unknown'}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Typography variant="h5" color="primary" gutterBottom>
                      ${product.pricePerItem?.toFixed(2) || '0.00'}
                    </Typography>
                    
                    <Typography variant="body2">
                      Min. Quantity: {product.minimumPurchaseQuantity || 1}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      component={Link}
                      to={`/store/orders/new?supplier=${product.supplier?._id}&product=${product._id}`}
                    >
                      Add to Order
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Products; 