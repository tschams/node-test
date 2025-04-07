import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Button, 
  Paper, 
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isSupplier, isStoreOwner } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect authenticated users to their respective dashboards
  React.useEffect(() => {
    if (isAuthenticated()) {
      if (isSupplier()) {
        navigate('/supplier/dashboard');
      } else if (isStoreOwner()) {
        navigate('/store/dashboard');
      }
    }
  }, [isAuthenticated, isSupplier, isStoreOwner, navigate]);
  
  return (
    <>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8, 
          mb: 4
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Grocery Store Management System
              </Typography>
              <Typography variant="h5" paragraph>
                A complete solution for grocery store owners and suppliers
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{ mr: 2, mb: 2 }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  component={Link}
                  to="/login"
                  sx={{ mb: 2 }}
                >
                  Login
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Grocery Store"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Features
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://images.unsplash.com/photo-1567449303078-a4893c14c8ec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                alt="Supplier Management"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  For Suppliers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Register and manage your account<br />
                  • Add and update your product offerings<br />
                  • View and manage orders from store owners<br />
                  • Track order fulfillment status
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/register">Join as Supplier</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
                alt="Store Management"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  For Store Owners
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Browse products from multiple suppliers<br />
                  • Place and manage orders easily<br />
                  • Track order status in real-time<br />
                  • Confirm receipt of delivered orders
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/register">Join as Store Owner</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Inventory Management"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Inventory Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Track inventory levels in real-time<br />
                  • Set automatic reorder thresholds<br />
                  • Integrate with point of sale systems<br />
                  • Get insights into product performance
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to="/login">Learn More</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="div" gutterBottom>
              Ready to streamline your grocery business?
            </Typography>
            <Typography variant="body1" paragraph>
              Join our platform today and experience the benefits of efficient store management.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              to="/register"
            >
              Get Started Now
            </Button>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Home; 