import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { getSupplierOrders, approveOrder, getOrderById } from '../../services/api';

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getSupplierOrders();
        setOrders(response.data.orders);
        
        // Set initial tab based on URL parameter
        const statusParam = searchParams.get('status');
        if (statusParam === 'pending') setTabValue(0);
        else if (statusParam === 'in-progress') setTabValue(1);
        else if (statusParam === 'completed') setTabValue(2);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [searchParams]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Update URL parameter based on tab
    let status;
    if (newValue === 0) status = 'pending';
    else if (newValue === 1) status = 'in-progress';
    else if (newValue === 2) status = 'completed';
    
    setSearchParams({ status });
  };
  
  const handleOrderApprove = async (orderId) => {
    try {
      await approveOrder(orderId);
      
      // Update the order in the local state
      const updatedOrders = orders.map(order => 
        order._id === orderId ? { ...order, status: 'in-progress' } : order
      );
      
      setOrders(updatedOrders);
      
      // Close dialog if open
      if (openDialog) {
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error approving order:', error);
      setError('Failed to approve order. Please try again.');
    }
  };
  
  const handleViewOrderDetails = async (orderId) => {
    try {
      setSelectedOrder(orderId);
      const response = await getOrderById(orderId);
      setOrderDetails(response.data.order);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again.');
    }
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOrderDetails(null);
  };
  
  // Filter orders based on current tab
  const filteredOrders = orders.filter(order => {
    if (tabValue === 0) return order.status === 'pending';
    if (tabValue === 1) return order.status === 'in-progress';
    if (tabValue === 2) return order.status === 'completed';
    return true;
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
      <Typography variant="h4" gutterBottom>
        Orders Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id.substring(0, 8)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.items.length} item(s)</TableCell>
                  <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={
                        order.status === 'pending' ? 'warning' : 
                        order.status === 'in-progress' ? 'info' : 
                        order.status === 'completed' ? 'success' : 'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewOrderDetails(order._id)}
                      sx={{ mr: 1 }}
                    >
                      View Details
                    </Button>
                    
                    {order.status === 'pending' && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        size="small"
                        onClick={() => handleOrderApprove(order._id)}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {orderDetails ? (
          <>
            <DialogTitle>
              Order Details #{orderDetails._id.substring(0, 8)}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1" gutterBottom>
                  Status: {orderDetails.status}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Order Date: {new Date(orderDetails.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Store Owner: {orderDetails.storeOwner.email}
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Items:
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderDetails.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">${item.priceAtOrder.toFixed(2)}</TableCell>
                          <TableCell align="right">${(item.quantity * item.priceAtOrder).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><strong>Order Total:</strong></TableCell>
                        <TableCell align="right"><strong>${orderDetails.totalPrice.toFixed(2)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Status History:
                </Typography>
                
                {orderDetails.statusHistory.map((statusChange, index) => (
                  <Typography variant="body2" key={index} gutterBottom>
                    {statusChange.status}: {new Date(statusChange.timestamp).toLocaleString()}
                  </Typography>
                ))}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {orderDetails.status === 'pending' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleOrderApprove(orderDetails._id)}
                >
                  Approve Order
                </Button>
              )}
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        ) : (
          <DialogContent>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Container>
  );
};

export default SupplierOrders; 