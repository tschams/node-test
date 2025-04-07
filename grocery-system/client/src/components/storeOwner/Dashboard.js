import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import { getStoreOrders, getAllProducts } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const StoreOwnerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, productsResponse] = await Promise.all([
          getStoreOrders(),
          getAllProducts()
        ]);
        
        setOrders(ordersResponse.data.orders || []);
        setProducts(productsResponse.data.products || []);
      } catch (error) {
        console.error('Error fetching store data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate order statistics
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const inProgressOrders = orders.filter(order => order.status === 'in-progress');
  const completedOrders = orders.filter(order => order.status === 'completed');
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Welcome, Store Owner
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to="/store/orders/new"
          startIcon={<AddShoppingCartIcon />}
          sx={{ py: 1.5, px: 3, fontSize: '1rem' }}
        >
          Place New Order
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Order Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Order Overview</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Pending Orders
                    </Typography>
                    <Typography variant="h4">
                      {pendingOrders.length}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={Link} to="/store/orders?status=pending">
                      View Pending Orders
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      In Progress
                    </Typography>
                    <Typography variant="h4">
                      {inProgressOrders.length}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={Link} to="/store/orders?status=in-progress">
                      View In Progress Orders
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Completed Orders
                    </Typography>
                    <Typography variant="h4">
                      {completedOrders.length}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={Link} to="/store/orders?status=completed">
                      View Completed Orders
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>Recent Orders</Typography>
              <Button component={Link} to="/store/orders">View All</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {orders.length > 0 ? (
              <List>
                {orders.slice(0, 5).map((order) => (
                  <ListItem key={order._id} divider>
                    <ListItemText
                      primary={`Order #${order._id.substring(0, 8)}`}
                      secondary={`Total: $${order.totalPrice.toFixed(2)} | Status: ${order.status}`}
                    />
                    <Chip 
                      label={order.status} 
                      color={
                        order.status === 'pending' ? 'warning' : 
                        order.status === 'in-progress' ? 'info' : 
                        order.status === 'completed' ? 'success' : 'default'
                      }
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1">No orders found</Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Products Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" gutterBottom>Available Products</Typography>
              <Button component={Link} to="/store/products">Browse Products</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                {products.length} products available from {new Set(products.map(p => p.supplier)).size} suppliers
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth 
              component={Link} 
              to="/store/orders/new"
            >
              Place New Order
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StoreOwnerDashboard; 