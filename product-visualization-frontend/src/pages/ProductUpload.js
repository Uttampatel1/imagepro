import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Box, Typography, Button, Paper, 
  CircularProgress, Alert, Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ProductUpload = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if user has an active subscription
  const hasSubscription = user?.subscription !== null;
  const imagesRemaining = hasSubscription
    ? user.subscription.tier_details.images_per_month - user.subscription.usage.images_generated
    : 0;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(false);
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      setUploading(false);
      
      // Navigate to scene selection with the image ID
      setTimeout(() => {
        navigate(`/scenes/${response.data.image_id}`);
      }, 1500);
      
    } catch (error) {
      setUploading(false);
      if (error.response) {
        setError(error.response.data.error || 'Upload failed. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  if (!hasSubscription) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Subscription Required
          </Typography>
          <Typography variant="body1" paragraph>
            You need an active subscription to upload and visualize products.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/subscription')}
          >
            View Subscription Plans
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Your Product
        </Typography>
        
        <Typography variant="body1" paragraph>
          Upload a high-quality image of your product. For best results, 
          use images with a clean or white background.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {imagesRemaining} images remaining in your {user.subscription.tier} plan.
        </Alert>
        
        <Paper 
          elevation={3} 
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            cursor: 'pointer',
            border: '2px dashed #ccc',
            borderRadius: 2,
            transition: 'all 0.3s',
            '&:hover': {
              borderColor: '#2196f3'
            }
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          {preview ? (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px',
                  objectFit: 'contain' 
                }} 
              />
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <CloudUploadIcon sx={{ fontSize: 72, color: '#9e9e9e', mb: 2 }} />
              <Typography variant="h6">
                Drag and drop your product image here or click to browse
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Supports: JPEG, PNG, WEBP (Max 10MB)
              </Typography>
            </Box>
          )}
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Image uploaded successfully! Redirecting to scene selection...
          </Alert>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {uploading ? 'Uploading...' : 'Continue to Scene Selection'}
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Tips for Best Results
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Use High Resolution
            </Typography>
            <Typography variant="body2">
              For best results, use high-resolution images with at least 1000px on the longest side.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Clean Background
            </Typography>
            <Typography variant="body2">
              Images with white or solid color backgrounds work best for accurate product isolation.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Good Lighting
            </Typography>
            <Typography variant="body2">
              Ensure your product is well-lit without harsh shadows for optimal results.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductUpload;