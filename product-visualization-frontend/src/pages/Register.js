// Register.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Paper,
  FormControlLabel, Checkbox, Alert, CircularProgress, Divider,
  Stepper, Step, StepLabel
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = ({ login }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  
  const steps = ['Account Details', 'Personal Information', 'Complete Registration'];
  
  useEffect(() => {
    // Validate password match
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword]);
  
  const handleNextStep = () => {
    if (activeStep === 0) {
      // Validate email and password
      if (!email) {
        setError('Email is required');
        return;
      }
      if (!password) {
        setError('Password is required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else if (activeStep === 1) {
      // Validate personal info
      if (!firstName || !lastName) {
        setError('First and last name are required');
        return;
      }
    }
    
    setError(null);
    setActiveStep((prev) => prev + 1);
  };
  
  const handleBackStep = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post('/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName
      });
      
      // Option 1: Auto login
      // login(response.data.access_token);
      
      // Option 2: Redirect to login with success message
      setLoading(false);
      navigate('/login', { 
        state: { 
          registered: true,
          email: email
        } 
      });
      
    } catch (error) {
      setLoading(false);
      if (error.response) {
        setError(error.response.data.error || 'Registration failed. Please try again.');
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
          <PersonAddIcon fontSize="large" />
        </Box>
        <Typography component="h1" variant="h5">
          Create your account
        </Typography>
        
        <Box sx={{ width: '100%', mt: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
          {activeStep === 0 && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Password must be at least 8 characters"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
              />
            </>
          )}
          
          {activeStep === 1 && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                id="companyName"
                label="Company Name (Optional)"
                name="companyName"
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </>
          )}
          
          {activeStep === 2 && (
            <>
              <Box sx={{ mb: 3, p: 3, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Account Summary
                </Typography>
                <Typography variant="body1">
                  Email: {email}
                </Typography>
                <Typography variant="body1">
                  Name: {firstName} {lastName}
                </Typography>
                {companyName && (
                  <Typography variant="body1">
                    Company: {companyName}
                  </Typography>
                )}
              </Box>
              
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link to="/terms" style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" component="span" color="primary">
                        Terms of Service
                      </Typography>
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" component="span" color="primary">
                        Privacy Policy
                      </Typography>
                    </Link>
                  </Typography>
                }
              />
            </>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            {activeStep > 0 ? (
              <Button onClick={handleBackStep}>
                Back
              </Button>
            ) : (
              <Box /> // Empty box for spacing
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNextStep}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !agreeTerms}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" component="span" color="primary">
                  Sign in
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;