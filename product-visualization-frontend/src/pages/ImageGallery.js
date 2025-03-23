import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Paper, CircularProgress,
  Grid, Card, CardMedia, CardContent, CardActions, Chip, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import {
  Delete as DeleteIcon, 
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Image as ImageIcon
} from '@mui/icons-material';

const ImageGallery = ({ user }) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  
  const ITEMS_PER_PAGE = 12;
  
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('/images');
        const sortedImages = response.data.images.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setImages(sortedImages);
        setFilteredImages(sortedImages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
        setLoading(false);
      }
    };
    
    fetchImages();
  }, []);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setPreviewOpen(true);
  };
  
  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };
  
  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setConfirmDeleteOpen(true);
  };
  
  const confirmDelete = async () => {
    try {
      await axios.delete(`/images/${imageToDelete.id}`);
      
      // Remove deleted image from state
      setImages(images.filter(img => img.id !== imageToDelete.id));
      setFilteredImages(filteredImages.filter(img => img.id !== imageToDelete.id));
      
      setConfirmDeleteOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error('Error deleting image:', error);
      setConfirmDeleteOpen(false);
    }
  };
  
  const handleDownload = async (imageId, generatedId) => {
    try {
      const response = await axios.get(`/images/${imageId}/download/${generatedId}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visualization-${generatedId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath, imageUrl) => {
    // If we have a direct URL from the API, use it
    if (imageUrl) {
      const baseUrl = axios.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
      return `${baseUrl}${imageUrl}`;
    }
    
    // Base API URL (remove the /api part for static files)
    const baseUrl = axios.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    
    // For full paths
    if (imagePath && imagePath.includes('/')) {
      // Extract just the filename from the path
      const filename = imagePath.split('/').pop();
      
      // Determine if it's from uploads or processed directory
      if (imagePath.includes('/uploads/')) {
        return `${baseUrl}/uploads/${filename}`;
      } else if (imagePath.includes('/processed/')) {
        return `${baseUrl}/processed/${filename}`;
      }
    }
    
    // If it's just a filename or undefined
    return imagePath ? `${baseUrl}/processed/${imagePath}` : 'https://via.placeholder.com/400x400?text=No+Image';
  };
  
  // Add image error handling function
  const handleImageError = (e, imagePath) => {
    console.error("Image failed to load:", imagePath);
    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
  };
  
  
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Your Product Visualizations
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/upload')}
          >
            Create New Visualization
          </Button>
        </Box>
        
        {images.length === 0 ? (
          <Paper elevation={2} sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ImageIcon sx={{ fontSize: 72, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No visualizations yet
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'center' }}>
              You haven't created any product visualizations yet. 
              Upload a product image to get started!
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/upload')}
            >
              Upload Product
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedImages.map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {image.generated_images && image.generated_images.length > 0 ? (
                      <CardMedia
                      component="img"
                      height="200"
                      image={getImageUrl(image.generated_images[0].path, image.generated_images[0].url)}
                      alt="Generated visualization"
                      sx={{ objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => handleImageClick(image)}
                      onError={(e) => handleImageError(e, image.generated_images[0].path)}
                    />
                    ) : (
                      <Box 
                        sx={{ 
                          height: 200,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#f5f5f5'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Processing...
                        </Typography>
                      </Box>
                    )}
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Product #{image.id.substring(0, 6)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Created: {formatDate(image.created_at)}
                      </Typography>
                      
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={`${image.generated_images.length} visualizations`}
                          color={image.generated_images.length > 0 ? "primary" : "default"}
                        />
                      </Box>
                    </CardContent>
                    
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/images/${image.id}`)}
                      >
                        View All
                      </Button>
                      
                      {image.generated_images.length > 0 && (
                        <IconButton 
                          size="small"
                          onClick={() => handleDownload(image.id, image.generated_images[0].id)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(image)}
                        sx={{ marginLeft: 'auto' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Image Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Product Visualization
          <IconButton
            aria-label="close"
            onClick={handlePreviewClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            &times;
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedImage && selectedImage.generated_images.length > 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <img 
  src={getImageUrl(selectedImage.generated_images[0].path, selectedImage.generated_images[0].url)}
  alt="Generated visualization"
  style={{ maxWidth: '100%', maxHeight: '70vh' }}
  onError={(e) => handleImageError(e, selectedImage.generated_images[0].path)}
/>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                Scene: {selectedImage.generated_images[0].scene}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Created on {formatDate(selectedImage.generated_images[0].created_at)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handlePreviewClose}>Close</Button>
          <Button 
            color="primary"
            onClick={() => navigate(`/images/${selectedImage.id}`)}
          >
            View All Visualizations
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this product visualization? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImageGallery;