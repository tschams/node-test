import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { getStoreOrders, updateOrderStatus } from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('status') || 'pending';
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(initialTab);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getStoreOrders();
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update URL without page reload
    const newParams = new URLSearchParams(location.search);
    newParams.set('status', newValue);
    navigate({ search: newParams.toString() }, { replace: true });
  };
  
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  const handleConfirmReceipt = async (orderId) => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      await updateOrderStatus(orderId, { status: 'completed' });
      
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? {
                ...order,
                status: 'completed',
                statusHistory: [
                  ...order.statusHistory,
                  { status: 'completed', timestamp: new Date().toISOString() }
                ]
              }
            : order
        )
      );
      
      // Close the dialog if the updated order is currently selected
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'completed',
          statusHistory: [
            ...selectedOrder.statusHistory,
            { status: 'completed', timestamp: new Date().toISOString() }
          ]
        });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredOrders = () => {
    return orders.filter(order => order.status === tabValue);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => {
      return total + (item.quantity * item.pricePerItem);
    }, 0);
  };
  
  if (loading && orders.length === 0) {
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
          Orders
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/store/orders/new')}
        >
          Place New Order
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Pending" value="pending" />
          <Tab label="In Progress" value="in-progress" />
          <Tab label="Completed" value="completed" />
        </Tabs>
      </Paper>
      
      {getFilteredOrders().length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            No {tabValue} orders found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredOrders().map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {order.supplier?.companyName || 'Unknown Supplier'}
                  </TableCell>
                  <TableCell>
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell align="right">
                    ${calculateOrderTotal(order).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewDetails(order)}
                      title="View Details"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    
                    {order.status === 'in-progress' && (
                      <IconButton 
                        size="small" 
                        color="success" 
                        onClick={() => handleConfirmReceipt(order._id)}
                        title="Confirm Receipt"
                        sx={{ ml: 1 }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Order Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details
            </DialogTitle>
            
            <DialogContent dividers>
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body1">
                  {selectedOrder._id}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Supplier
                </Typography>
                <Typography variant="body1">
                  {selectedOrder.supplier?.companyName || 'Unknown Supplier'}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedOrder.createdAt)}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status History
                </Typography>
                <List dense>
                  {selectedOrder.statusHistory.map((history, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={`${history.status.charAt(0).toUpperCase() + history.status.slice(1)}`}
                        secondary={formatDate(history.timestamp)}
                      />
                      <Chip 
                        label={history.status.charAt(0).toUpperCase() + history.status.slice(1)} 
                        color={getStatusColor(history.status)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name || 'Unknown Product'}</TableCell>
                          <TableCell align="right">${item.pricePerItem?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">${(item.pricePerItem * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          Total:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          ${calculateOrderTotal(selectedOrder).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDetails}>
                Close
              </Button>
              
              {selectedOrder.status === 'in-progress' && (
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => {
                    handleConfirmReceipt(selectedOrder._id);
                    handleCloseDetails();
                  }}
                  startIcon={<CheckCircleIcon />}
                >
                  Confirm Receipt
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Orders; 