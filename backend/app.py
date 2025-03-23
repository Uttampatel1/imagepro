from dotenv import load_dotenv

load_dotenv()  

import os
import base64
import json
import uuid
from datetime import datetime, timedelta
from io import BytesIO

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from PIL import Image, ImageOps
import PIL.Image  # Add this import
import requests
from google import genai
from google.genai import types



# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['PROCESSED_FOLDER'] = 'processed'
app.config['GEMINI_API_KEY'] = os.environ.get('GEMINI_API_KEY')
app.config['STRIPE_API_KEY'] = os.environ.get('STRIPE_API_KEY')

genai.api_key = app.config['GEMINI_API_KEY']

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

# Initialize JWT
jwt = JWTManager(app)

# Initialize Google Gemini API client
# genai.configure(api_key=app.config['GEMINI_API_KEY'])

# Mock database (replace with a real database in production)
users_db = {}
images_db = {}
subscriptions_db = {}

# Subscription tiers
SUBSCRIPTION_TIERS = {
    'free': {
        'price': 0,
        'images_per_month': 10,
        'features': ['Basic scenes', 'Standard resolution', 'Community support']
    },
    'starter': {
        'price': 49,
        'images_per_month': 20,
        'features': ['Basic scenes', 'Standard resolution', 'Email support']
    },
    'business': {
        'price': 149,
        'images_per_month': 100,
        'features': ['Advanced scenes', 'High resolution', 'Priority support']
    },
    'enterprise': {
        'price': 499,
        'images_per_month': 500,
        'features': ['Custom backgrounds', 'Priority processing', 'Dedicated support']
    }
}


# Scene templates
SCENE_TEMPLATES = {
    'living_room': 'A modern living room with natural lighting',
    'kitchen': 'A spacious kitchen with marble countertops',
    'office': 'A professional office setting with a desk and chair',
    'outdoor': 'An outdoor patio with greenery',
    'bedroom': 'A cozy bedroom with contemporary furniture',
    'bathroom': 'A clean bathroom with white tiles'
}

# Route to serve uploaded images
@app.route('/uploads/<filename>')
def serve_upload(filename):
    """Serve original uploaded images"""
    response = send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    # Add CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/processed/<filename>')
def serve_processed(filename):
    """Serve processed and generated images"""
    response = send_file(os.path.join(app.config['PROCESSED_FOLDER'], filename))
    # Add CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    if email in users_db:
        return jsonify({'error': 'User already exists'}), 400
    
    # Create user with free tier subscription automatically assigned
    users_db[email] = {
        'password_hash': generate_password_hash(password),
        'created_at': datetime.now().isoformat(),
        'subscription': {
            'tier': 'free',
            'started_at': datetime.now().isoformat(),
            'next_billing_date': (datetime.now() + timedelta(days=30)).isoformat()
        },
        'usage': {
            'images_generated': 0,
            'last_reset': datetime.now().isoformat()
        }
    }
    
    access_token = create_access_token(identity=email)
    return jsonify({
        'access_token': access_token,
        'message': 'Account created with free subscription (10 images)'
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = users_db.get(email)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=email)
    return jsonify({'access_token': access_token}), 200

# Subscription routes
@app.route('/api/subscriptions', methods=['GET'])
def get_subscription_tiers():
    return jsonify(SUBSCRIPTION_TIERS), 200

@app.route('/api/subscribe', methods=['POST'])
@jwt_required()
def subscribe():
    email = get_jwt_identity()
    data = request.json
    tier = data.get('tier')
    
    if tier not in SUBSCRIPTION_TIERS:
        return jsonify({'error': 'Invalid subscription tier'}), 400
    
    # In a real app, this would integrate with Stripe or another payment processor
    # For now, we'll simulate successful subscription
    users_db[email]['subscription'] = {
        'tier': tier,
        'started_at': datetime.now().isoformat(),
        'next_billing_date': (datetime.now() + timedelta(days=30)).isoformat()
    }
    
    return jsonify({'message': f'Successfully subscribed to {tier} tier'}), 200

@app.route('/api/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    email = get_jwt_identity()
    subscription = users_db[email].get('subscription')
    
    if not subscription:
        return jsonify({'subscription': None}), 200
    
    subscription_info = subscription.copy()
    subscription_info['tier_details'] = SUBSCRIPTION_TIERS[subscription['tier']]
    subscription_info['usage'] = users_db[email]['usage']
    
    return jsonify({'subscription': subscription_info}), 200

# Image upload and processing routes
@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_image():
    email = get_jwt_identity()
    
    # Check if user has an active subscription
    if not users_db[email].get('subscription'):
        return jsonify({'error': 'Active subscription required'}), 403
    
    # Check if user has reached their image limit
    tier = users_db[email]['subscription']['tier']
    limit = SUBSCRIPTION_TIERS[tier]['images_per_month']
    if users_db[email]['usage']['images_generated'] >= limit:
        return jsonify({'error': 'Monthly image limit reached'}), 403
    
    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save uploaded file
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
    # Process image (background removal)
    try:
        processed_path = process_image(file_path)
        
        # Create image record
        image_id = str(uuid.uuid4())
        images_db[image_id] = {
            'owner': email,
            'original_path': file_path,
            'processed_path': processed_path,
            'generated_images': [],
            'created_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'image_id': image_id,
            'message': 'Image uploaded and processed successfully'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scenes', methods=['GET'])
@jwt_required()
def get_scenes():
    return jsonify({'scenes': SCENE_TEMPLATES}), 200

@app.route('/api/generate', methods=['POST'])
@jwt_required()
def generate_image():
    email = get_jwt_identity()
    data = request.json
    image_id = data.get('image_id')
    scene = data.get('scene')
    custom_prompt = data.get('custom_prompt', '')
    
    # Validate inputs
    if not image_id or not scene:
        return jsonify({'error': 'Image ID and scene are required'}), 400
    
    if image_id not in images_db or images_db[image_id]['owner'] != email:
        return jsonify({'error': 'Image not found or access denied'}), 404
    
    if scene not in SCENE_TEMPLATES and not custom_prompt:
        return jsonify({'error': 'Invalid scene selected'}), 400
    
    # Get scene prompt
    scene_prompt = SCENE_TEMPLATES.get(scene, custom_prompt)
    
    try:
        # Generate image using Gemini
        generated_path = generate_with_gemini(
            images_db[image_id]['processed_path'],
            scene_prompt
        )
        
        # Update image record and user usage
        generated_id = str(uuid.uuid4())
        images_db[image_id]['generated_images'].append({
            'id': generated_id,
            'path': generated_path,
            'scene': scene,
            'prompt': scene_prompt,
            'created_at': datetime.now().isoformat()
        })
        
        users_db[email]['usage']['images_generated'] += 1
        
        return jsonify({
            'generated_id': generated_id,
            'message': 'Image generated successfully',
            'remaining_images': SUBSCRIPTION_TIERS[users_db[email]['subscription']['tier']]['images_per_month'] - users_db[email]['usage']['images_generated']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images', methods=['GET'])
@jwt_required()
def get_images():
    email = get_jwt_identity()
    
    # Collect all images owned by the user
    user_images = []
    for image_id, image_data in images_db.items():
        if image_data['owner'] == email:
            # Add URL fields to make it easier for frontend
            image_info = {
                'id': image_id,
                'created_at': image_data['created_at'],
                'generated_images': []
            }
            
            # Add URLs to generated images
            for gen_img in image_data['generated_images']:
                gen_img_copy = gen_img.copy()
                gen_filename = os.path.basename(gen_img['path'])
                gen_img_copy['url'] = f"/processed/{gen_filename}"
                image_info['generated_images'].append(gen_img_copy)
                
                # Debug output
                print(f"Gallery image - Generated image path: {gen_img['path']}")
                print(f"Gallery image - Generated image URL: {gen_img_copy['url']}")
            
            user_images.append(image_info)
    
    return jsonify({'images': user_images}), 200

@app.route('/api/images/<image_id>', methods=['GET'])
@jwt_required()
def get_image(image_id):
    email = get_jwt_identity()
    
    if image_id not in images_db or images_db[image_id]['owner'] != email:
        return jsonify({'error': 'Image not found or access denied'}), 404
    
    # Get image data
    image_data = images_db[image_id].copy()
    
    # Add api-friendly paths
    original_filename = os.path.basename(image_data['original_path'])
    processed_filename = os.path.basename(image_data['processed_path'])
    
    image_data['original_url'] = f"/uploads/{original_filename}"
    image_data['processed_url'] = f"/processed/{processed_filename}"
    
    # Debug output
    print(f"Original image path: {image_data['original_path']}")
    print(f"Original image URL: {image_data['original_url']}")
    print(f"Processed image path: {image_data['processed_path']}")
    print(f"Processed image URL: {image_data['processed_url']}")
    
    # Update generated images with urls
    for gen_img in image_data['generated_images']:
        gen_filename = os.path.basename(gen_img['path'])
        gen_img['url'] = f"/processed/{gen_filename}"
        print(f"Generated image path: {gen_img['path']}")
        print(f"Generated image URL: {gen_img['url']}")
    
    return jsonify({'image': image_data}), 200

@app.route('/api/images/<image_id>/download/<generated_id>', methods=['GET'])
@jwt_required()
def download_image(image_id, generated_id):
    email = get_jwt_identity()
    
    if image_id not in images_db or images_db[image_id]['owner'] != email:
        return jsonify({'error': 'Image not found or access denied'}), 404
    
    # Find the generated image
    generated_image = None
    for gen_img in images_db[image_id]['generated_images']:
        if gen_img['id'] == generated_id:
            generated_image = gen_img
            break
    
    if not generated_image:
        return jsonify({'error': 'Generated image not found'}), 404
    
    return send_file(generated_image['path'], as_attachment=True)

# Image processing functions

# Add these debug statements to your backend functions

def process_image(image_path):
    """
    Process the uploaded image by removing background
    In a production app, this would use a dedicated background removal service or ML model
    """
    print(f"Processing image: {image_path}")
    img = Image.open(image_path)
    
    # Simple background removal simulation (replace with actual implementation)
    # Here we're just creating a transparent version, but real implementation
    # would use segmentation models to isolate the product
    img = img.convert("RGBA")
    
    # Simple transparency around edges (demo only)
    # In production, use proper background removal service like Remove.bg or ML models
    datas = img.getdata()
    newData = []
    
    # This is just a simplified demo - real background removal is more complex
    for item in datas:
        # If pixel is whitish, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img.putdata(newData)
    
    # Save processed image
    processed_filename = os.path.join(
        app.config['PROCESSED_FOLDER'], 
        f"processed_{os.path.basename(image_path)}"
    )
    img.save(processed_filename, "PNG")
    
    print(f"Saved processed image to: {processed_filename}")
    return processed_filename

def generate_with_gemini(processed_image_path, scene_prompt):
    """Generate a new image using Google's Gemini API"""
    print(f"Generating visualization for image: {processed_image_path} with prompt: {scene_prompt}")
    
    # Initialize Gemini client with API key
    client = genai.Client(api_key=app.config['GEMINI_API_KEY'])
    
    # Load the image directly with PIL
    image = PIL.Image.open(processed_image_path)
    
    # Create the prompt text
    text_input = (
        f"Place this product in {scene_prompt}. Make it look professional and realistic. "
        f"The product should be the main focus in the scene. "
        f"The lighting should be consistent and the shadows realistic."
    )
    
    # Generate image using Gemini image editing
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp-image-generation",
            contents=[text_input, image],
            config=types.GenerateContentConfig(
                response_modalities=['Text', 'Image']
            )
        )
        
        # Extract and save the generated image
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                # Log any text response from the model
                print(f"Gemini response text: {part.text}")
            elif part.inline_data is not None:
                # Save the generated image
                generated_img = Image.open(BytesIO(part.inline_data.data))
                generated_path = os.path.join(
                    app.config['PROCESSED_FOLDER'],
                    f"generated_{uuid.uuid4()}.png"
                )
                generated_img.save(generated_path)
                print(f"Saved generated image to: {generated_path}")
                return generated_path
        
        raise Exception("No image was generated")
            
    except Exception as e:
        print(f"Error generating image with Gemini: {str(e)}")
        raise
    
    
def generate_with_imagen(scene_prompt):
    """Generate a scene using Google's Imagen API"""
    client = genai.Client()
    
    try:
        response = client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=scene_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )
        
        for generated_image in response.generated_images:
            image = Image.open(BytesIO(generated_image.image.image_bytes))
            generated_path = os.path.join(
                app.config['PROCESSED_FOLDER'],
                f"scene_{uuid.uuid4()}.png"
            )
            image.save(generated_path)
            return generated_path
        
        raise Exception("No image was generated")
            
    except Exception as e:
        print(f"Error generating image with Imagen: {str(e)}")
        raise

# Server startup
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))