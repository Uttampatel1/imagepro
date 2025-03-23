import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Paper, CircularProgress,
  Grid, Card, CardContent, CardActions, Divider, List, ListItem,
  ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Image as ImageIcon,
  Speed as SpeedIcon,
  HighQuality as HighQualityIcon,
  Redeem as FreeIcon
} from '@mui/icons-material';

const Subscription = ({ user, fetchUserData }) => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/subscriptions');
        setPlans(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === 0) return 'FREE';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);

    // If free plan, subscribe directly without payment dialog
    if (planKey === 'free') {
      handleFreeSubscribe();
    } else {
      setCheckoutOpen(true);
    }
  };

  const handleFreeSubscribe = async () => {
    setPaymentLoading(true);
    setError(null);

    try {
      await axios.post('/subscribe', {
        tier: 'free'
      });

      setPaymentLoading(false);
      setSuccess('Successfully subscribed to free plan with 10 images!');

      // Refresh user data
      await fetchUserData();

    } catch (error) {
      setPaymentLoading(false);
      if (error.response) {
        setError(error.response.data.error || 'Subscription failed. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
    setError(null);
  };

  const handleCardNumberChange = (e) => {
    // Format card number with spaces
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e) => {
    // Format expiry date as MM/YY
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setExpiry(value);
    } else {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    }
  };

  const handleCvcChange = (e) => {
    // Only allow 3-4 digits
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  const handleSubscribe = async () => {
    // Validate form
    if (!cardNumber || !cardName || !expiry || !cvc) {
      setError('Please fill in all payment details');
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      // In a real app, this would integrate with Stripe or similar
      // For demo, we'll just simulate API call
      await axios.post('/subscribe', {
        tier: selectedPlan
      });

      setPaymentLoading(false);
      setCheckoutOpen(false);
      setSuccess(`Successfully subscribed to ${selectedPlan} plan!`);

      // Refresh user data
      await fetchUserData();

    } catch (error) {
      setPaymentLoading(false);
      if (error.response) {
        setError(error.response.data.error || 'Subscription failed. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  const getFeatureIcon = (feature) => {
    if (feature.toLowerCase().includes('resolution')) {
      return <HighQualityIcon color="primary" />;
    } else if (feature.toLowerCase().includes('priority')) {
      return <SpeedIcon color="primary" />;
    } else {
      return <CheckCircleIcon color="primary" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  const currentPlan = user?.subscription?.tier;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Subscription Plans
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {currentPlan && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom>
              Your Current Plan: <strong>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong>
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  {/* Add null checks here to fix the error: */}
                  <Typography variant="body1">
                    Images remaining: <strong>
                      {plans[currentPlan] ?
                        (plans[currentPlan].images_per_month - user.subscription.usage.images_generated)
                        : 0
                      }
                    </strong> of {plans[currentPlan]?.images_per_month || 0}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Next reset date: {new Date(user.subscription.next_billing_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSuccess(null)}
                >
                  Manage Subscription
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Grid container spacing={4} alignItems="stretch">
          {/* Free Plan Card */}
          <Grid item xs={12} md={3}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: currentPlan === 'free' ? '2px solid #2196f3' : 'none'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FreeIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5" component="div">
                    Free
                  </Typography>
                </Box>

                <Typography variant="h4" color="primary" gutterBottom>
                  FREE
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>10</strong> visualizations per month
                </Typography>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  {plans.free && plans.free.features.map((feature, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getFeatureIcon(feature)}
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                {currentPlan === 'free' ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handlePlanSelect('free')}
                  >
                    {currentPlan ? 'Switch to Free' : 'Start Free'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>

          {/* Other subscription tiers */}
          {Object.entries(plans).filter(([key]) => key !== 'free').map(([key, plan]) => (
            <Grid item xs={12} md={3} key={key}>
              <Card
                elevation={key === 'business' ? 5 : 3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: currentPlan === key ? '2px solid #2196f3' : 'none',
                  transform: key === 'business' ? { md: 'scale(1.05)' } : 'none',
                  zIndex: key === 'business' ? 2 : 1
                }}
              >
                {key === 'business' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#f50057',
                      color: 'white',
                      py: 0.5,
                      px: 1.5,
                      borderRadius: '0 4px 0 4px'
                    }}
                  >
                    POPULAR
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {key === 'starter' && <ImageIcon fontSize="large" color="primary" sx={{ mr: 1 }} />}
                    {key === 'business' && <SpeedIcon fontSize="large" color="primary" sx={{ mr: 1 }} />}
                    {key === 'enterprise' && <StarIcon fontSize="large" color="primary" sx={{ mr: 1 }} />}

                    <Typography variant="h5" component="div">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                  </Box>

                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(plan.price)}<Typography variant="body1" component="span" color="text.secondary">/month</Typography>
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>{plan.images_per_month}</strong> visualizations per month
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getFeatureIcon(feature)}
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {currentPlan === key ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color={key === 'business' ? 'secondary' : 'primary'}
                      fullWidth
                      onClick={() => handlePlanSelect(key)}
                    >
                      {currentPlan ? 'Switch Plan' : 'Select Plan'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            All Plans Include
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">AI-powered scene generation</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">Background removal</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">Secure image storage</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">Commercial usage rights</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Checkout Dialog (for paid plans) */}
      <Dialog
        open={checkoutOpen}
        onClose={handleCheckoutClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Complete Your Subscription
        </DialogTitle>

        <DialogContent>
          {selectedPlan && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(plans[selectedPlan].price)} per month
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Payment Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Card Number"
                    fullWidth
                    variant="outlined"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 19 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Cardholder Name"
                    fullWidth
                    variant="outlined"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Smith"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Expiry Date"
                    fullWidth
                    variant="outlined"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="CVC"
                    fullWidth
                    variant="outlined"
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="123"
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Your subscription will begin immediately and will be billed monthly.
                You can cancel or change your plan at any time.
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCheckoutClose} disabled={paymentLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            color="primary"
            variant="contained"
            disabled={paymentLoading}
            startIcon={paymentLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {paymentLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Subscription;