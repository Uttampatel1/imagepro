import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Grid, Paper, Divider,
  Card, CardMedia, CardContent, CardActions, IconButton,
  Tooltip, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, Tabs, Tab, Alert, Chip,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  AddPhotoAlternate as NewSceneIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Launch as OpenIcon,
  ContentCopy as DuplicateIcon
} from '@mui/icons-material';

const ImageDetail = ({ user }) => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const actionMenuOpen = Boolean(actionMenuAnchor);

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
  
  // Add a debug function to check image loading
  const handleImageError = (e, imagePath) => {
    console.error("Image failed to load:", imagePath);
    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
  };
  
  
  // Fetch image data
  useEffect(() => {
    const fetchImageData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/images/${imageId}`);
        console.log("Image data:", response.data.image);
        setImageData(response.data.image);
        
        // Set the first generated image as selected by default
        if (response.data.image.generated_images && response.data.image.generated_images.length > 0) {
          setSelectedImage(response.data.image.generated_images[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching image data:', error);
        setError('Failed to load image data. Please try again or go back to the gallery.');
        setLoading(false);
      }
    };
    
    fetchImageData();
  }, [imageId]);
  
  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Handle image selection
  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };
  
  // Open full-size preview
  const handleOpenPreview = () => {
    if (selectedImage) {
      setPreviewOpen(true);
    }
  };
  
  // Close preview
  const handleClosePreview = () => {
    setPreviewOpen(false);
  };
  
  // Handle open action menu
  const handleActionMenuOpen = (event) => {
    setActionMenuAnchor(event.currentTarget);
  };
  
  // Handle close action menu
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };
  
  // Delete confirmation for generated image
  const handleDeleteGeneratedImage = (generatedImage) => {
    setImageToDelete(generatedImage);
    setDeleteType('generated');
    setConfirmDeleteOpen(true);
    handleActionMenuClose();
  };
  
  // Delete confirmation for entire product entry
  const handleDeleteProduct = () => {
    setImageToDelete(imageData);
    setDeleteType('product');
    setConfirmDeleteOpen(true);
    handleActionMenuClose();
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setImageToDelete(null);
    setDeleteType('');
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'generated') {
        // Delete a specific generated image
        await axios.delete(`/images/${imageId}/generated/${imageToDelete.id}`);
        
        // Update local state
        const updatedGeneratedImages = imageData.generated_images.filter(
          img => img.id !== imageToDelete.id
        );
        
        setImageData({
          ...imageData,
          generated_images: updatedGeneratedImages
        });
        
        // Update selected image if needed
        if (selectedImage && selectedImage.id === imageToDelete.id) {
          setSelectedImage(updatedGeneratedImages.length > 0 ? updatedGeneratedImages[0] : null);
        }
        
        setSuccess('Visualization deleted successfully');
      } else if (deleteType === 'product') {
        // Delete the entire product entry
        await axios.delete(`/images/${imageId}`);
        
        // Navigate back to gallery
        navigate('/gallery', { state: { deleted: true } });
        return; // Exit early to avoid further processing
      }
      
      // Close dialog and reset state
      setConfirmDeleteOpen(false);
      setImageToDelete(null);
      setDeleteType('');
      
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete. Please try again.');
      setConfirmDeleteOpen(false);
    }
  };
  
  // Handle download
  const handleDownload = async (generatedId) => {
    try {
      setDownloadLoading(true);
      
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
      
      setDownloadLoading(false);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
      setDownloadLoading(false);
    }
  };
  
  // Handle share
  const handleShare = () => {
    // In a real app, this might generate a shareable link via the backend
    // For now, we'll just simulate it
    const shareableLink = `https://app.productvisualize.ai/shared/${imageId}/${selectedImage?.id}`;
    setShareLink(shareableLink);
    setShareDialogOpen(true);
    handleActionMenuClose();
  };
  
  // Copy share link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setSuccess('Link copied to clipboard');
    setTimeout(() => {
      setShareDialogOpen(false);
    }, 1500);
  };
  
  // Navigate to new scene generation
  const handleNewScene = () => {
    navigate(`/scenes/${imageId}`);
    handleActionMenuClose();
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format scene name
  const formatSceneName = (sceneName) => {
    if (sceneName === 'custom') return 'Custom Scene';
    return sceneName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error && !imageData) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/gallery')}
        >
          Back to Gallery
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/gallery')}
          sx={{ mr: 2 }}
        >
          Back to Gallery
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Product Visualization
        </Typography>
        <Tooltip title="More actions">
          <IconButton 
            onClick={handleActionMenuOpen}
            aria-label="more actions"
          >
            <MoreIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
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
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 0, 
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            {/* Current visualization */}
            <Box 
              sx={{ 
                position: 'relative',
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                cursor: selectedImage ? 'pointer' : 'default',
                overflow: 'hidden',
                minHeight: 400
              }}
              onClick={handleOpenPreview}
            >
              {selectedImage ? (
                <img 
                  src={getImageUrl(selectedImage.path, selectedImage.url)}
                  alt="Product visualization"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => handleImageError(e, selectedImage.path)}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No visualizations available
                </Typography>
              )}
            </Box>
            
            {/* Tabs for different views */}
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="visualization views"
              >
                <Tab label="Visualizations" />
                <Tab label="Original Product" />
                <Tab label="Details" />
              </Tabs>
            </Box>
            
            {/* Tab content */}
            <Box sx={{ p: 3, display: currentTab === 0 ? 'block' : 'none' }}>
              <Grid container spacing={2}>
                {imageData.generated_images && imageData.generated_images.length > 0 ? (
                  imageData.generated_images.map((image) => (
                    <Grid item xs={6} sm={4} md={3} key={image.id}>
                      <Card 
                        elevation={selectedImage && selectedImage.id === image.id ? 3 : 1}
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedImage && selectedImage.id === image.id ? '2px solid #2196f3' : 'none',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleImageSelect(image)}
                      >
                        <CardMedia
                          component="img"
                          height="100"
                          image={getImageUrl(image.path, image.url)}
                          alt={`Visualization in ${formatSceneName(image.scene)}`}
                          sx={{ objectFit: 'cover' }}
                          onError={(e) => handleImageError(e, image.path)}
                        />
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="caption" display="block" noWrap>
                            {formatSceneName(image.scene)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No visualizations have been generated yet.
                    </Typography>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<NewSceneIcon />}
                        onClick={() => navigate(`/scenes/${imageId}`)}
                      >
                        Generate Visualization
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
            
            <Box sx={{ p: 3, display: currentTab === 1 ? 'block' : 'none' }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1,
                  p: 2
                }}
              >
                <img 
                  src={getImageUrl(imageData.original_path, imageData.original_url)}
                  alt="Original product"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => handleImageError(e, imageData.original_path)}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Original Product Image
                </Typography>
                <Typography variant="body2">
                  This is the original product image you uploaded. 
                  We've automatically removed the background to place it in different scenes.
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ p: 3, display: currentTab === 2 ? 'block' : 'none' }}>
              <Typography variant="subtitle1" gutterBottom>
                Image Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(imageData.created_at)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Number of Visualizations:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {imageData.generated_images?.length || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                {selectedImage && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Current Visualization Details
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Scene:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatSceneName(selectedImage.scene)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Created:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(selectedImage.created_at)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Prompt:
                      </Typography>
                      <Typography variant="body1" gutterBottom sx={{ wordBreak: 'break-word' }}>
                        {selectedImage.prompt}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Visualization Options
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<NewSceneIcon />}
                onClick={() => navigate(`/scenes/${imageId}`)}
                sx={{ mb: 2 }}
              >
                Create New Visualization
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                Generate additional visualizations using this product in different scenes
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {selectedImage && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Visualization
                </Typography>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Chip 
                    label={formatSceneName(selectedImage.scene)} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={formatDate(selectedImage.created_at)} 
                    variant="outlined" 
                  />
                </Box>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedImage.id)}
                  disabled={downloadLoading}
                  sx={{ mb: 2 }}
                >
                  {downloadLoading ? 'Downloading...' : 'Download'}
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  sx={{ mb: 2 }}
                >
                  Share
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteGeneratedImage(selectedImage)}
                >
                  Delete This Visualization
                </Button>
              </Box>
            )}
            
            <Box sx={{ mt: 'auto' }}>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Product Management
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<DeleteIcon />}
                onClick={handleDeleteProduct}
                sx={{ mt: 1 }}
              >
                Delete Product & All Visualizations
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Full size preview dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedImage && formatSceneName(selectedImage.scene)}
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            &times;
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img 
                src={getImageUrl(selectedImage.path, selectedImage.url)}
                alt="Product visualization"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
                onError={(e) => handleImageError(e, selectedImage.path)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          {selectedImage && (
            <Button 
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(selectedImage.id)}
              disabled={downloadLoading}
            >
              {downloadLoading ? 'Downloading...' : 'Download'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>
          {deleteType === 'generated' ? 'Delete Visualization?' : 'Delete Product?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {deleteType === 'generated' 
              ? 'Are you sure you want to delete this visualization? This action cannot be undone.'
              : 'Are you sure you want to delete this product and all its visualizations? This action cannot be undone.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Share dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      >
        <DialogTitle>Share Visualization</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Share this link with others to view this visualization:
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            p: 1,
            borderRadius: 1
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                flexGrow: 1, 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mr: 1
              }}
            >
              {shareLink}
            </Typography>
            <IconButton size="small" onClick={handleCopyLink}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Anyone with this link will be able to view this visualization without logging in.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button onClick={handleCopyLink} startIcon={<CopyIcon />}>
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Actions menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={actionMenuOpen}
        onClose={handleActionMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={handleNewScene}>
          <ListItemIcon>
            <NewSceneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create New Visualization</ListItemText>
        </MenuItem>
        
        {selectedImage && (
          <MenuItem onClick={handleShare}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => { 
          handleActionMenuClose();
          navigate('/gallery');
        }}>
          <ListItemIcon>
            <BackIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Back to Gallery</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDeleteProduct} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Product</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ImageDetail;