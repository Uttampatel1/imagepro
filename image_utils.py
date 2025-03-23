# image_utils.py
import os
import io
import uuid
import base64
from typing import Tuple, Optional, Dict, Any, List
import logging

import numpy as np
from PIL import Image, ImageOps
from google import genai
from google.genai import types

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImageProcessor:
    """Handles image processing operations for the product visualization service."""
    
    def __init__(self, 
                 upload_folder: str, 
                 processed_folder: str,
                 gemini_api_key: str,
                 max_image_size: int = 1500,
                 min_image_size: int = 500):
        """
        Initialize the image processor.
        
        Args:
            upload_folder: Directory to store original uploaded images
            processed_folder: Directory to store processed images
            gemini_api_key: Google Gemini API key
            max_image_size: Maximum dimension for images (width or height)
            min_image_size: Minimum dimension for images (width or height)
        """
        self.upload_folder = upload_folder
        self.processed_folder = processed_folder
        self.max_image_size = max_image_size
        self.min_image_size = min_image_size
        
        # Ensure directories exist
        os.makedirs(upload_folder, exist_ok=True)
        os.makedirs(processed_folder, exist_ok=True)
        
        # Initialize Google Gemini API client
        genai.configure(api_key=gemini_api_key)
        self.gemini_client = genai.Client()

    def save_upload(self, file) -> Tuple[str, str]:
        """
        Save an uploaded file and generate a unique filename.
        
        Args:
            file: File object from Flask request
            
        Returns:
            Tuple of (unique_id, file_path)
        """
        unique_id = str(uuid.uuid4())
        filename = f"{unique_id}_{file.filename}"
        file_path = os.path.join(self.upload_folder, filename)
        
        file.save(file_path)
        logger.info(f"Saved uploaded file to {file_path}")
        
        return unique_id, file_path
    
    def remove_background(self, image_path: str) -> str:
        """
        Remove the background from an image.
        
        In production, this would use a dedicated ML model or service.
        For this example, we'll use a simplified approach with color thresholding.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Path to the processed image with transparent background
        """
        try:
            # Load image
            img = Image.open(image_path).convert("RGBA")
            
            # Resize if needed
            img = self._resize_image(img)
            
            # Simple background removal
            # In production, use a specialized model or service like Remove.bg
            processed_img = self._simple_background_removal(img)
            
            # Save processed image
            processed_filename = os.path.join(
                self.processed_folder, 
                f"processed_{os.path.basename(image_path).split('.')[0]}.png"
            )
            processed_img.save(processed_filename, "PNG")
            
            logger.info(f"Processed image saved to {processed_filename}")
            return processed_filename
            
        except Exception as e:
            logger.error(f"Error removing background: {str(e)}")
            raise
    
    def _resize_image(self, img: Image.Image) -> Image.Image:
        """
        Resize an image to fit within the maximum dimensions while preserving aspect ratio.
        Also ensures the image meets minimum size requirements.
        
        Args:
            img: PIL Image object
            
        Returns:
            Resized PIL Image object
        """
        width, height = img.size
        
        # Check if resize is needed
        if width > self.max_image_size or height > self.max_image_size:
            # Calculate the scaling factor
            scale = min(self.max_image_size / width, self.max_image_size / height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {width}x{height} to {new_width}x{new_height}")
        
        # Ensure minimum size
        width, height = img.size
        if width < self.min_image_size or height < self.min_image_size:
            # Calculate scaling factor to meet minimum size
            scale = max(self.min_image_size / width, self.min_image_size / height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Upscaled small image to {new_width}x{new_height}")
        
        return img
    
    def _simple_background_removal(self, img: Image.Image) -> Image.Image:
        """
        A simple background removal method using color thresholding.
        
        Note: This is a simplistic approach. In production, use a proper
        segmentation model or a dedicated service like Remove.bg.
        
        Args:
            img: PIL Image object
            
        Returns:
            PIL Image with transparent background
        """
        # Convert to numpy array for processing
        np_img = np.array(img)
        
        # Create alpha mask (fully opaque initially)
        if np_img.shape[2] == 3:  # RGB image
            alpha = np.ones((np_img.shape[0], np_img.shape[1]), dtype=np.uint8) * 255
            np_img = np.dstack((np_img, alpha))
        
        # Get RGB channels
        r, g, b, a = np_img[:, :, 0], np_img[:, :, 1], np_img[:, :, 2], np_img[:, :, 3]
        
        # Detect likely background pixels (whitish colors)
        # This is a simplistic approach - real background removal is more complex
        white_threshold = 240
        is_white = (r > white_threshold) & (g > white_threshold) & (b > white_threshold)
        
        # Create mask
        np_img[:, :, 3] = np.where(is_white, 0, 255)
        
        # Convert back to PIL image
        result_img = Image.fromarray(np_img)
        
        return result_img
    
    def generate_visualization(self, 
                              processed_image_path: str, 
                              scene_prompt: str,
                              custom_options: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a visualization using Google's Gemini API.
        
        Args:
            processed_image_path: Path to the processed image with transparent background
            scene_prompt: Description of the scene to place the product in
            custom_options: Optional additional parameters for generation
            
        Returns:
            Path to the generated image
        """
        try:
            # Read the processed image
            with open(processed_image_path, 'rb') as f:
                image_bytes = f.read()
            
            # Convert bytes to PIL Image for Gemini
            image = Image.open(io.BytesIO(image_bytes))
            
            # Create a full prompt with instructions for the AI
            text_prompt = self._create_gemini_prompt(scene_prompt, custom_options)
            
            logger.info(f"Generating visualization with prompt: {text_prompt}")
            
            # Call Gemini Image Generation API
            response = self.gemini_client.models.generate_content(
                model="gemini-2.0-flash-exp-image-generation",
                contents=[text_prompt, image],
                config=types.GenerateContentConfig(
                    response_modalities=['Text', 'Image']
                )
            )
            
            # Extract and save the generated image
            generated_path = None
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    generated_img = Image.open(io.BytesIO(part.inline_data.data))
                    generated_path = os.path.join(
                        self.processed_folder,
                        f"generated_{uuid.uuid4()}.png"
                    )
                    generated_img.save(generated_path)
                    logger.info(f"Generated visualization saved to {generated_path}")
                    break
            
            if not generated_path:
                raise Exception("No image was generated in the API response")
                
            return generated_path
            
        except Exception as e:
            logger.error(f"Error generating visualization: {str(e)}")
            raise
    
    def _create_gemini_prompt(self, scene_prompt: str, custom_options: Optional[Dict[str, Any]] = None) -> str:
        """
        Create an optimized prompt for Gemini image generation.
        
        Args:
            scene_prompt: Base description of the desired scene
            custom_options: Additional options for customizing the generation
            
        Returns:
            Formatted prompt string
        """
        # Base prompt template
        base_prompt = (
            f"Place this product in {scene_prompt}. "
            f"Make it look professional and realistic. "
            f"The product should be the main focus in the scene. "
            f"The lighting should be consistent with natural shadows. "
            f"Make sure the image looks like a professional product photo."
        )
        
        # Add custom options if provided
        if custom_options:
            if custom_options.get('lighting'):
                base_prompt += f" Use {custom_options['lighting']} lighting."
                
            if custom_options.get('angle'):
                base_prompt += f" Show the product from a {custom_options['angle']} angle."
                
            if custom_options.get('style'):
                base_prompt += f" The overall style should be {custom_options['style']}."
                
            if custom_options.get('additional_elements'):
                base_prompt += f" Include {custom_options['additional_elements']} in the scene."
        
        return base_prompt
    
    def generate_scene(self, scene_prompt: str) -> str:
        """
        Generate a background scene using Google's Imagen API.
        This can be used to create scenes for later product placement.
        
        Args:
            scene_prompt: Description of the scene to generate
            
        Returns:
            Path to the generated scene image
        """
        try:
            logger.info(f"Generating scene with prompt: {scene_prompt}")
            
            # Call Imagen API
            response = self.gemini_client.models.generate_images(
                model='imagen-3.0-generate-002',
                prompt=scene_prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                )
            )
            
            # Save the generated scene
            generated_path = None
            for generated_image in response.generated_images:
                scene_img = Image.open(io.BytesIO(generated_image.image.image_bytes))
                generated_path = os.path.join(
                    self.processed_folder,
                    f"scene_{uuid.uuid4()}.png"
                )
                scene_img.save(generated_path)
                logger.info(f"Generated scene saved to {generated_path}")
                break
            
            if not generated_path:
                raise Exception("No scene was generated in the API response")
                
            return generated_path
            
        except Exception as e:
            logger.error(f"Error generating scene: {str(e)}")
            raise
    
    def batch_process(self, image_paths: List[str], scenes: List[str]) -> List[str]:
        """
        Process multiple images with different scenes in batch.
        
        Args:
            image_paths: List of paths to original images
            scenes: List of scene descriptions (one per image)
            
        Returns:
            List of paths to generated visualizations
        """
        results = []
        
        for i, (image_path, scene) in enumerate(zip(image_paths, scenes)):
            try:
                logger.info(f"Processing batch item {i+1}/{len(image_paths)}")
                
                # Remove background
                processed_path = self.remove_background(image_path)
                
                # Generate visualization
                generated_path = self.generate_visualization(processed_path, scene)
                
                results.append(generated_path)
                
            except Exception as e:
                logger.error(f"Error processing batch item {i+1}: {str(e)}")
                results.append(None)
        
        return results


# Example usage:
if __name__ == "__main__":
    # This code would run when testing the module directly
    processor = ImageProcessor(
        upload_folder="uploads",
        processed_folder="processed",
        gemini_api_key="YOUR_API_KEY"
    )
    
    # Example single image processing
    processed_img = processor.remove_background("uploads/sample_product.jpg")
    visualization = processor.generate_visualization(
        processed_img,
        "a modern living room with natural lighting",
        custom_options={
            "lighting": "warm afternoon",
            "angle": "slightly elevated",
            "style": "minimalist Scandinavian"
        }
    )
    
    print(f"Generated visualization: {visualization}")