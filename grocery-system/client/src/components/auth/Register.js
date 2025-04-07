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
  Alert,
  Grid
} from '@mui/material';
import { register } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'supplier',
    companyName: '',
    phoneNumber: '',
    representativeName: ''
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
      const response = await register(formData);
      authLogin(response.data.user, response.data.token);
      
      // Redirect based on role
      if (formData.role === 'supplier') {
        navigate('/supplier/dashboard');
      } else {
        navigate('/store/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setFormError(errorMessage);
      setError(errorMessage);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
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
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              
              {formData.role === 'supplier' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="companyName"
                      label="Company Name"
                      id="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="phoneNumber"
                      label="Phone Number"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="representativeName"
                      label="Representative Name"
                      id="representativeName"
                      value={formData.representativeName}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
            >
              Already have an account? Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 