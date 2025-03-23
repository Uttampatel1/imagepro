import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Paper, CircularProgress,
  Grid, Card, CardMedia, CardContent, CardActionArea, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';

const SceneSelection = ({ user }) => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch scenes
        const scenesResponse = await axios.get('/scenes');
        setScenes(scenesResponse.data.scenes);
        
        // Fetch image data
        const imageResponse = await axios.get(`/images/${imageId}`);
        setOriginalImage(imageResponse.data.image);
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [imageId]);
  
  const handleSceneSelect = (sceneKey) => {
    if (sceneKey === 'custom') {
      setShowCustomPrompt(true);
      setSelectedScene('custom');
    } else {
      setSelectedScene(sceneKey);
      setShowCustomPrompt(false);
    }
  };
  
  const handleCustomPromptClose = () => {
    setShowCustomPrompt(false);
    if (customPrompt === '') {
      setSelectedScene(null);
    }
  };
  
  const handleGenerate = async () => {
    if (!selectedScene) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const payload = {
        image_id: imageId,
        scene: selectedScene === 'custom' ? 'custom' : selectedScene,
        custom_prompt: selectedScene === 'custom' ? customPrompt : ''
      };
      
      const response = await axios.post('/generate', payload);
      
      setSuccess(`Image generated successfully! You have ${response.data.remaining_images} images remaining in your plan.`);
      setGenerating(false);
      
      // Navigate to the image detail page
      setTimeout(() => {
        navigate(`/images/${imageId}`);
      }, 2000);
      
    } catch (error) {
      setGenerating(false);
      if (error.response) {
        setError(error.response.data.error || 'Generation failed. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Sample scene images (in production, these would be actual previews)
  const scenePreviewImages = {
    living_room: 'https://via.placeholder.com/300x200?text=Living+Room',
    kitchen: 'https://via.placeholder.com/300x200?text=Kitchen',
    office: 'https://via.placeholder.com/300x200?text=Office',
    outdoor: 'https://via.placeholder.com/300x200?text=Outdoor',
    bedroom: 'https://via.placeholder.com/300x200?text=Bedroom',
    bathroom: 'https://via.placeholder.com/300x200?text=Bathroom',
    custom: 'https://via.placeholder.com/300x200?text=Custom+Scene'
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Choose a Scene for Your Product
        </Typography>
        
        <Typography variant="body1" paragraph>
          Select an environment to visualize your product in. The AI will place your product 
          in the selected scene with realistic lighting and perspective.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Product
              </Typography>
              
              {originalImage ? (
                <Box 
                  sx={{ 
                    width: '100%',
                    height: 250,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={`${axios.defaults.baseURL.replace('/api', '')}/uploads/${originalImage.processed_path.split('/').pop()}`} 
                    alt="Original product" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    width: '100%',
                    height: 250,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}
                >
                  <ImageIcon sx={{ fontSize: 72, color: '#9e9e9e' }} />
                </Box>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Subscription Tier: <strong>{user.subscription.tier}</strong>
                </Typography>
                <Typography variant="body2">
                  Images Remaining: <strong>{user.subscription.tier_details.images_per_month - user.subscription.usage.images_generated}</strong>
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Select a Scene
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(scenes).map(([key, description]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Card 
                    elevation={selectedScene === key ? 5 : 1}
                    sx={{ 
                      border: selectedScene === key ? '2px solid #2196f3' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <CardActionArea onClick={() => handleSceneSelect(key)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={scenePreviewImages[key]}
                        alt={key}
                      />
                      <CardContent>
                        <Typography variant="subtitle1" component="div">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
              
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  elevation={selectedScene === 'custom' ? 5 : 1}
                  sx={{ 
                    border: selectedScene === 'custom' ? '2px solid #2196f3' : 'none',
                    transition: 'all 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleSceneSelect('custom')}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <AddIcon sx={{ fontSize: 48, color: '#9e9e9e', mb: 2 }} />
                      <Typography variant="subtitle1" component="div">
                        Custom Scene
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Describe your own scene or environment
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/upload')}
              >
                Back to Upload
              </Button>
              
              <Button 
                variant="contained" 
                color="primary" 
                disabled={!selectedScene || generating}
                onClick={handleGenerate}
                startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <WallpaperIcon />}
              >
                {generating ? 'Generating...' : 'Generate Visualization'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Custom Scene Dialog */}
      <Dialog open={showCustomPrompt} onClose={handleCustomPromptClose} maxWidth="md" fullWidth>
        <DialogTitle>Describe Your Custom Scene</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            Describe the environment, lighting, and atmosphere where you want your product to be visualized.
            Be as specific as possible for the best results.
          </Typography>
          
          <TextField
            autoFocus
            label="Custom Scene Description"
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Example: A minimalist Scandinavian living room with natural light coming through large windows, wooden flooring, and a few green plants."
          />
          
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Tip: Include details about lighting, colors, style, and specific elements you want in the scene.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCustomPromptClose}>Cancel</Button>
          <Button 
            onClick={handleCustomPromptClose} 
            color="primary"
            disabled={!customPrompt.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SceneSelection;