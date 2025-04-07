import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Paper,
  Alert
} from '@mui/material';
import { login } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'supplier'
  });
  
  const [formError, setFormError] = useState('');
  const { login: authLogin, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await login(formData);
      authLogin(response.data.user, response.data.token);
      
      // Redirect based on role
      if (formData.role === 'supplier') {
        navigate('/supplier/dashboard');
      } else {
        navigate('/store/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setFormError(errorMessage);
      setError(errorMessage);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>
          
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                I am a:
              </Typography>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel value="supplier" control={<Radio />} label="Supplier" />
                <FormControlLabel value="storeOwner" control={<Radio />} label="Store Owner" />
              </RadioGroup>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
            >
              Don't have an account? Sign Up
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 