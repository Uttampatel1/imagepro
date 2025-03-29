import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Grid, Paper, TextField,
  Card, CardMedia, CardContent, Divider, List, ListItem,
  ListItemIcon, ListItemText, Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  PhotoCamera as PhotoCameraIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  CreditCard as CreditCardIcon,
  FormatPaint as FormatPaintIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    if (email) {
      // Pre-fill the registration form with the provided email
      navigate('/register', { state: { email } });
    } else {
      navigate('/register');
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: '#f8f9fa',
          pt: 10,
          pb: 15,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                sx={{ mb: 2 }}
              >
                Transform Your
                <Box component="span" sx={{ color: '#2196f3' }}> Product Imagery</Box>
                <br />
                with AI
              </Typography>

              <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
                Create stunning product visualizations in seconds, without expensive photoshoots
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
                <TextField
                  variant="outlined"
                  placeholder="Your email address"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ maxWidth: { sm: 300 } }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  icon={<CheckCircleIcon fontSize="small" />}
                  label="No credit card required"
                  variant="outlined"
                />
                <Chip
                  icon={<CheckCircleIcon fontSize="small" />}
                  label="14-day free trial"
                  variant="outlined"
                />
                <Chip
                  icon={<CheckCircleIcon fontSize="small" />}
                  label="Cancel anytime"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 300, md: 400 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: 3
                }}
              >
                <img
                  src="https://dummyimage.com/800x800/000/fff&text=Product+Visualization+Demo"
                  alt="Product visualization demo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            zIndex: 0
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: 'rgba(33, 150, 243, 0.05)',
            zIndex: 0
          }}
        />
      </Box>

      {/* Before/After Section */}
      <Container maxWidth="lg" sx={{ my: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            See the Difference
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Transform basic product photos into stunning marketing visuals with one click
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image="https://dummyimage.com/800x800?text=Before:+Basic+Product+Photo"
                  alt="Before: Basic product photo"
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: 2
                  }}
                >
                  <Typography variant="h6">Before</Typography>
                  <Typography variant="body2">Basic product photo</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="400"
                  image="https://dummyimage.com/800x800?text=After:+AI+Enhanced+Visualization"
                  alt="After: AI enhanced visualization"
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: 2
                  }}
                >
                  <Typography variant="h6">After</Typography>
                  <Typography variant="body2">AI-enhanced visualization in custom scene</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Our AI-powered platform makes product visualization simple and fast
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <PhotoCameraIcon sx={{ fontSize: 80, color: '#2196f3' }} />
                </Box>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom align="center">
                    1. Upload Your Product
                  </Typography>
                  <Typography variant="body1" align="center">
                    Upload any product image. Our AI automatically removes the background.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <SettingsIcon sx={{ fontSize: 80, color: '#2196f3' }} />
                </Box>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom align="center">
                    2. Choose Your Scene
                  </Typography>
                  <Typography variant="body1" align="center">
                    Select from our library of scenes or describe your own custom environment.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <FormatPaintIcon sx={{ fontSize: 80, color: '#2196f3' }} />
                </Box>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom align="center">
                    3. Generate & Download
                  </Typography>
                  <Typography variant="body1" align="center">
                    Our AI places your product in the scene with realistic lighting and shadows.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ my: 10 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              Why Choose Our Service?
            </Typography>

            <List>
              <ListItem disableGutters>
                <ListItemIcon>
                  <SpeedIcon color="primary" fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="h6">Save Time & Money</Typography>}
                  secondary="Generate professional product visuals in seconds without expensive photoshoots"
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemIcon>
                  <FormatPaintIcon color="primary" fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="h6">Unlimited Creativity</Typography>}
                  secondary="Visualize your products in any environment or setting imaginable"
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemIcon>
                  <CreditCardIcon color="primary" fontSize="large" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="h6">Affordable Plans</Typography>}
                  secondary="Flexible subscription options to fit businesses of any size"
                />
              </ListItem>
            </List>

            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
            >
              Start Your Free Trial
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2
              }}
            >
              <Paper elevation={3} sx={{ gridColumn: '1 / 2', gridRow: '1 / 3', height: 300, overflow: 'hidden' }}>
                <img
                  src="https://dummyimage.com/400x600?text=Product+Example+1"
                  alt="Product visualization example"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Paper>

              <Paper elevation={3} sx={{ gridColumn: '2 / 3', gridRow: '1 / 2', height: 140, overflow: 'hidden' }}>
                <img
                  src="https://dummyimage.com/300x200?text=Product+Example+2"
                  alt="Product visualization example"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Paper>

              <Paper elevation={3} sx={{ gridColumn: '2 / 3', gridRow: '2 / 3', height: 140, overflow: 'hidden' }}>
                <img
                  src="https://dummyimage.com/300x200?text=Product+Example+3"
                  alt="Product visualization example"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* // This is just the updated pricing section of the LandingPage.js component */}
      {/* // to highlight the free plan */}

      {/* Pricing Section */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Start for free, upgrade as you grow
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {/* Free Plan */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Free
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <Typography variant="h3" component="div" color="primary">
                      FREE
                    </Typography>
                  </Box>

                  <Typography variant="body1" paragraph>
                    Perfect for trying out the service
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="10 images per month" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Basic scenes" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Standard resolution" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Community support" />
                    </ListItem>
                  </List>

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/register')}
                  >
                    Start Free
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Starter Plan */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Starter
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <Typography variant="h3" component="div" color="primary">
                      $49
                      <Typography variant="body1" component="span" color="text.secondary">
                        /month
                      </Typography>
                    </Typography>
                  </Box>

                  <Typography variant="body1" paragraph>
                    Perfect for small businesses and startups
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="20 images per month" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Basic scenes" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Standard resolution" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Email support" />
                    </ListItem>
                  </List>

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/register')}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Business Plan - Popular */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={5}
                sx={{
                  height: '100%',
                  transform: { md: 'scale(1.05)' },
                  position: 'relative',
                  border: '2px solid #2196f3'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#2196f3',
                    color: 'white',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: '0 0 0 4px'
                  }}
                >
                  MOST POPULAR
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Business
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <Typography variant="h3" component="div" color="primary">
                      $149
                      <Typography variant="body1" component="span" color="text.secondary">
                        /month
                      </Typography>
                    </Typography>
                  </Box>

                  <Typography variant="body1" paragraph>
                    Ideal for growing businesses with regular needs
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="100 images per month" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Advanced scenes" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="High resolution" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Priority support" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Custom scene descriptions" />
                    </ListItem>
                  </List>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/register')}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Enterprise Plan */}
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Enterprise
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <Typography variant="h3" component="div" color="primary">
                      $499
                      <Typography variant="body1" component="span" color="text.secondary">
                        /month
                      </Typography>
                    </Typography>
                  </Box>

                  <Typography variant="body1" paragraph>
                    For businesses with high-volume requirements
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="500+ images per month" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Custom backgrounds" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Priority processing" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Dedicated support" />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="API access" />
                    </ListItem>
                  </List>

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/register')}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              All paid plans include a 14-day free trial. No credit card required to start with Free plan.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ my: 10, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
          Ready to Transform Your Product Photography?
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          Join thousands of businesses that are saving time and money with our AI-powered visualization service
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ py: 1.5, px: 4 }}
        >
          Start Your Free Trial Today
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No credit card required. Cancel anytime.
        </Typography>
      </Container>
    </Box>
  );
};

export default LandingPage;