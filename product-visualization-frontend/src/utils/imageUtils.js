// src/utils/imageUtils.js
import axios from 'axios';

/**
 * Utility function to get image URL from path or URL field
 * @param {string} imagePath - The image path 
 * @param {string} imageUrl - The image URL from API (optional)
 * @returns {string} The complete image URL
 */
export const getImageUrl = (imagePath, imageUrl) => {
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

/**
 * Handle image loading errors
 * @param {Event} e - The error event
 * @param {string} imagePath - The image path that failed to load
 */
export const handleImageError = (e, imagePath) => {
  console.error("Image failed to load:", imagePath);
  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
};

/**
 * Handle image loading errors with fallback attempt
 * @param {Event} e - The error event
 * @param {Object} imageData - The image data containing paths and URLs
 */
export const handleProductImageError = (e, imageData) => {
  console.error("Failed to load processed image:", imageData.processed_path);
  
  // Try original image as fallback
  if (imageData.original_url) {
    const baseUrl = axios.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
    e.target.src = `${baseUrl}${imageData.original_url}`;
  } else if (imageData.original_path) {
    e.target.src = getImageUrl(imageData.original_path);
  } else {
    e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image+Not+Found';
  }
  
  // If that fails too, show placeholder
  e.target.onerror = () => {
    console.error("Failed to load original image as fallback");
    e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image+Not+Found';
    e.target.onerror = null; // Prevent infinite loop
  };
};