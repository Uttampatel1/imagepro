// Login.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Paper,
  FormControlLabel, Checkbox, Alert, CircularProgress, Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = ({ login }) => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post('/login', {
        email,
        password
      });
      
      // Store token
      login(response.data.access_token);
      
    } catch (error) {
      setLoading(false);
      if (error.response) {
        setError(error.response.data.error || 'Login failed. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: 'primary.main', 
            borderRadius: '50%', 
            mb: 2,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LockOutlinedIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5">
          Sign in to your account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        {location.state?.registered && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            Registration successful! Please sign in.
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox 
                value="remember" 
                color="primary" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2" color="primary">
                Forgot password?
              </Typography>
            </Link>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" component="span" color="primary">
                  Sign up now
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;