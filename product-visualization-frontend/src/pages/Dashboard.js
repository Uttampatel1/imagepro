import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Grid, Paper, Card, CardContent,
  CardActions, LinearProgress, Divider, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import {
  Image as ImageIcon,
  Add as AddIcon,
  ShowChart as ShowChartIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  AddAPhoto as AddAPhotoIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [recentImages, setRecentImages] = useState([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    imagesThisMonth: 0,
    remainingImages: 0,
    mostUsedScene: ''
  });
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent images
      const imagesResponse = await axios.get('/images');
      
      // Sort by creation date (newest first) and take the most recent 5
      const sortedImages = imagesResponse.data.images
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setRecentImages(sortedImages);
      
      // Calculate stats
      const allImages = imagesResponse.data.images;
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const imagesThisMonth = allImages.filter(
        img => new Date(img.created_at) >= firstDayOfMonth
      ).length;
      
      // Count occurrences of each scene
      const sceneCounts = {};
      allImages.forEach(image => {
        image.generated_images.forEach(genImg => {
          const scene = genImg.scene;
          sceneCounts[scene] = (sceneCounts[scene] || 0) + 1;
        });
      });
      
      // Find the most used scene
      let mostUsedScene = '';
      let maxCount = 0;
      
      Object.entries(sceneCounts).forEach(([scene, count]) => {
        if (count > maxCount) {
          mostUsedScene = scene;
          maxCount = count;
        }
      });
      
      // Calculate remaining images
      const remainingImages = user.subscription
        ? user.subscription.tier_details.images_per_month - user.subscription.usage.images_generated
        : 0;
      
      setStats({
        totalImages: allImages.length,
        imagesThisMonth,
        remainingImages,
        mostUsedScene: mostUsedScene || 'None'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Dashboard
          </Typography>
          
          <Box>
            <Tooltip title="Refresh data">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
              >
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Subscription Status Card */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: user?.subscription ? '#f8f9fa' : '#fff0f0',
            border: user?.subscription ? 'none' : '1px solid #ffcdd2',
            borderRadius: 2
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h6" gutterBottom>
                {user?.subscription 
                  ? `${user.subscription.tier.charAt(0).toUpperCase() + user.subscription.tier.slice(1)} Plan` 
                  : 'No Active Subscription'
                }
              </Typography>
              
              {user?.subscription ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Images used: {user.subscription.usage.images_generated} of {user.subscription.tier_details.images_per_month}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(user.subscription.usage.images_generated / user.subscription.tier_details.images_per_month) * 100} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Next billing date: {formatDate(user.subscription.next_billing_date)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" paragraph>
                  Subscribe to a plan to start creating product visualizations
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              {user?.subscription ? (
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => navigate('/subscription')}
                >
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/subscription')}
                >
                  View Plans
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Total Visualizations
                  </Typography>
                  <ImageIcon color="primary" />
                </Box>
                <Typography variant="h4" component="div">
                  {stats.totalImages}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  All time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography color="text.secondary" gutterBottom>
                    This Month
                  </Typography>
                  <ShowChartIcon color="primary" />
                </Box>
                <Typography variant="h4" component="div">
                  {stats.imagesThisMonth}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Visualizations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Remaining
                  </Typography>
                  <AddIcon color="primary" />
                </Box>
                <Typography variant="h4" component="div">
                  {stats.remainingImages}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Available images
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Most Used Scene
                  </Typography>
                  <SettingsIcon color="primary" />
                </Box>
                <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                  {stats.mostUsedScene === 'custom' 
                    ? 'Custom' 
                    : stats.mostUsedScene.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                  }
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Preferred setting
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Recent Activity & Quick Actions */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              {recentImages.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <ImageIcon sx={{ fontSize: 48, color: '#9e9e9e', mb: 1 }} />
                  <Typography variant="body1">
                    No visualizations created yet
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddAPhotoIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/upload')}
                  >
                    Create Your First Visualization
                  </Button>
                </Box>
              ) : (
                <List>
                  {recentImages.map((image, index) => (
                    <React.Fragment key={image.id}>
                      <ListItem 
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="view" 
                            onClick={() => navigate(`/images/${image.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <ImageIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Product #${image.id.substring(0, 6)}`}
                          secondary={`Created on ${formatDate(image.created_at)} • ${image.generated_images.length} visualizations`}
                        />
                      </ListItem>
                      {index < recentImages.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              {recentImages.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/gallery')}
                  >
                    View All Visualizations
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<AddAPhotoIcon />}
                    onClick={() => navigate('/upload')}
                    sx={{ py: 1.5 }}
                  >
                    Create New Visualization
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ImageIcon />}
                    onClick={() => navigate('/gallery')}
                  >
                    Image Gallery
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SettingsIcon />}
                    onClick={() => navigate('/settings')}
                  >
                    Account Settings
                  </Button>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Need Help?
              </Typography>
              
              <Typography variant="body2" paragraph>
                Check out our documentation and tutorials to get the most out of your product visualizations.
              </Typography>
              
              <Button
                variant="text"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => window.open('https://docs.example.com', '_blank')}
              >
                View Documentation
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;