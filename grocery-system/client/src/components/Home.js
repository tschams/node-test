import React, { useContext } from 'react';
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
  CardMedia,
  Divider
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isStoreOwner, isSupplier } = useContext(AuthContext);

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          Grocery Store Management System
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Manage suppliers, inventory, and orders all in one place
        </Typography>
        
        {isAuthenticated() && isStoreOwner() && (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            to="/store/orders/new"
            startIcon={<ShoppingCartIcon />}
            sx={{ mt: 3, mb: 5, py: 1.5, px: 4, fontSize: '1.2rem' }}
          >
            Place New Order
          </Button>
        )}
      </Box>
      
      {(!isAuthenticated() || !isStoreOwner()) && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 6, 
            backgroundColor: 'primary.light', 
            color: 'white' 
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {isAuthenticated() ? 'Quick Access' : 'Get Started'}
              </Typography>
              <Typography variant="body1" paragraph>
                {isAuthenticated() 
                  ? 'Access the most important features of the system:'
                  : 'Log in or register to access the full functionality of the system.'}
              </Typography>
              <Box>
                {!isAuthenticated() && (
                  <>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/login"
                      sx={{ mr: 2, backgroundColor: 'white', color: 'primary.main' }}
                    >
                      Log In
                    </Button>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to="/register"
                      sx={{ borderColor: 'white', color: 'white' }}
                    >
                      Register
                    </Button>
                  </>
                )}
                
                {isAuthenticated() && isSupplier() && (
                  <>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/supplier/dashboard"
                      sx={{ mr: 2, backgroundColor: 'white', color: 'primary.main' }}
                    >
                      Supplier Dashboard
                    </Button>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to="/supplier/products"
                      sx={{ mr: 2, borderColor: 'white', color: 'white' }}
                    >
                      Manage Products
                    </Button>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to="/supplier/orders"
                      sx={{ borderColor: 'white', color: 'white' }}
                    >
                      View Orders
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              {isAuthenticated() && isSupplier() ? (
                <LocalShippingIcon sx={{ fontSize: 100 }} />
              ) : (
                <ShoppingCartIcon sx={{ fontSize: 100 }} />
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {isAuthenticated() && isStoreOwner() && (
        <Box mb={8}>
          <Typography variant="h4" gutterBottom mb={3}>
            Store Owner Quick Actions
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderWidth: 2,
                  borderColor: 'secondary.main',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: -15, 
                    left: 20, 
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  Recommended
                </Box>
                <CardContent sx={{ pt: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ShoppingCartIcon color="secondary" sx={{ fontSize: 30, mr: 1 }} />
                    <Typography variant="h5" component="div">
                      Place a New Order
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Order products from suppliers with our step-by-step process. Browse available products, 
                    select quantities, and submit your order in minutes.
                  </Typography>
                </CardContent>
                <Box flexGrow={1} />
                <CardActions>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    fullWidth
                    size="large"
                    component={Link}
                    to="/store/orders/new"
                    startIcon={<ShoppingCartIcon />}
                  >
                    Place New Order
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <StoreIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                    <Typography variant="h5" component="div">
                      Browse Products
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    View all available products from your suppliers. Filter by supplier, search for specific 
                    items, and add products directly to your order.
                  </Typography>
                </CardContent>
                <Box flexGrow={1} />
                <CardActions>
                  <Button 
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/store/products"
                  >
                    Browse Products
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      <Divider sx={{ mb: 6 }} />
      
      <Typography variant="h4" gutterBottom>
        System Features
      </Typography>
      
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{ 
                height: 100, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'primary.light'
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 50, color: 'white' }} />
            </CardMedia>
            <CardContent>
              <Typography variant="h6" component="div">
                Order Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, track, and manage orders with suppliers. View order history and status.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{ 
                height: 100, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'secondary.light'
              }}
            >
              <InventoryIcon sx={{ fontSize: 50, color: 'white' }} />
            </CardMedia>
            <CardContent>
              <Typography variant="h6" component="div">
                Inventory Control
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track stock levels and automatically place orders when inventory runs low.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{ 
                height: 100, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'success.light'
              }}
            >
              <LocalShippingIcon sx={{ fontSize: 50, color: 'white' }} />
            </CardMedia>
            <CardContent>
              <Typography variant="h6" component="div">
                Supplier Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage supplier information, products, and order history in one place.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{ 
                height: 100, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'info.light'
              }}
            >
              <StoreIcon sx={{ fontSize: 50, color: 'white' }} />
            </CardMedia>
            <CardContent>
              <Typography variant="h6" component="div">
                Store Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access store metrics, sales data, and inventory reports for better decision making.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 