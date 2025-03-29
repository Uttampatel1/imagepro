# Import the necessary flask modules and functions
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, send_file, current_app
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

from functools import wraps
import re

import os
from pymongo import MongoClient

from sub_config import SUBSCRIPTION_TIERS
from werkzeug.security import generate_password_hash, check_password_hash

# Create admin blueprint
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

try:
    # Replace <db_password> with the actual database password
    mongo_uri = admin_bp.config['MONGO_URI'].replace('<db_password>', os.environ.get('DB_PASSWORD', ''))
    client = MongoClient(mongo_uri)
    db = client.image_visualization  # Database name
    
    # Collections
    users_collection = db.users
    images_collection = db.images
    
    # Create indexes for better query performance
    users_collection.create_index('email', unique=True)
    images_collection.create_index('owner')
    
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    raise


# Include the admin_required decorator
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        # Implementation as shown in artifact
        pass
    return wrapper

# Add these imports to your app.py
from flask import Flask, request, jsonify, send_file, current_app
from functools import wraps
import re

# Add this new field to your user schema when creating users
# In the register function:
# 'role': 'user',  # Default role
# 'is_active': False,  # Default to inactive if admin approval required
# 'pending_activation': True  # Marks user as pending admin approval

# Add this decorator to restrict routes to admin users
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        email = get_jwt_identity()
        user = users_collection.find_one({'email': email})
        
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        return fn(*args, **kwargs)
    return wrapper

# Add these routes to your app.py

# Get all users (admin only)
@admin_bp.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    # Query parameters for filtering, sorting, and pagination
    query = {}
    status_filter = request.args.get('status')
    role_filter = request.args.get('role')
    search = request.args.get('search')
    
    # Apply filters
    if status_filter:
        if status_filter == 'active':
            query['is_active'] = True
        elif status_filter == 'inactive':
            query['is_active'] = False
        elif status_filter == 'pending':
            query['pending_activation'] = True
            
    if role_filter:
        query['role'] = role_filter
        
    if search:
        # Search in email, first_name, last_name, or company_name
        query['$or'] = [
            {'email': {'$regex': search, '$options': 'i'}},
            {'first_name': {'$regex': search, '$options': 'i'}},
            {'last_name': {'$regex': search, '$options': 'i'}},
            {'company_name': {'$regex': search, '$options': 'i'}}
        ]
    
    # Pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    skip = (page - 1) * per_page
    
    # Sorting
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = int(request.args.get('sort_order', -1))  # -1 for descending, 1 for ascending
    
    # Execute query
    total_users = users_collection.count_documents(query)
    users_cursor = users_collection.find(query).sort(sort_by, sort_order).skip(skip).limit(per_page)
    
    # Format results
    users = []
    for user in users_cursor:
        # Remove sensitive data
        user.pop('password_hash', None)
        
        # Convert ObjectId and datetime to string
        user_dict = {k: (str(v) if k == '_id' else (v.isoformat() if isinstance(v, datetime) else v)) 
                    for k, v in user.items()}
        
        # Convert nested datetime objects
        if 'subscription' in user_dict and 'started_at' in user_dict['subscription']:
            user_dict['subscription']['started_at'] = user['subscription']['started_at'].isoformat()
            user_dict['subscription']['next_billing_date'] = user['subscription']['next_billing_date'].isoformat()
            
        if 'usage' in user_dict and 'last_reset' in user_dict['usage']:
            user_dict['subscription']['last_reset'] = user['usage']['last_reset'].isoformat()
            
        users.append(user_dict)
    
    # Return with pagination metadata
    return jsonify({
        'users': users,
        'total': total_users,
        'page': page,
        'per_page': per_page,
        'total_pages': (total_users + per_page - 1) // per_page
    }), 200

# Get user by ID (admin only)
@admin_bp.route('/api/admin/users/<user_id>', methods=['GET'])
@admin_required
def get_user_by_id(user_id):
    try:
        # Convert string ID to ObjectId for MongoDB
        object_id = ObjectId(user_id)
    except:
        return jsonify({'error': 'Invalid user ID format'}), 400
    
    user = users_collection.find_one({'_id': object_id})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Remove sensitive data
    user.pop('password_hash', None)
    
    # Convert ObjectId and datetime to string
    user_dict = {k: (str(v) if k == '_id' else (v.isoformat() if isinstance(v, datetime) else v)) 
                for k, v in user.items()}
    
    # Get user's image count
    image_count = images_collection.count_documents({'owner': user['email']})
    user_dict['image_count'] = image_count
    
    return jsonify({'user': user_dict}), 200

# Update user (admin only)
@admin_bp.route('/api/admin/users/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    try:
        # Convert string ID to ObjectId for MongoDB
        object_id = ObjectId(user_id)
    except:
        return jsonify({'error': 'Invalid user ID format'}), 400
    
    data = request.json
    
    # Fields that can be updated by admin
    allowed_fields = [
        'first_name', 'last_name', 'company_name', 
        'role', 'is_active', 'pending_activation'
    ]
    
    # Filter out unwanted fields
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    # Additional validation
    if 'role' in update_data and update_data['role'] not in ['admin', 'user']:
        return jsonify({'error': 'Invalid role value'}), 400
    
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    # Update user
    result = users_collection.update_one(
        {'_id': object_id},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'message': 'User updated successfully'}), 200

# Activate/deactivate user (admin only)
@admin_bp.route('/api/admin/users/<user_id>/activation', methods=['PUT'])
@admin_required
def set_user_activation(user_id):
    try:
        # Convert string ID to ObjectId for MongoDB
        object_id = ObjectId(user_id)
    except:
        return jsonify({'error': 'Invalid user ID format'}), 400
    
    data = request.json
    activate = data.get('activate', False)
    
    update_data = {
        'is_active': activate,
        'pending_activation': False
    }
    
    # Update user
    result = users_collection.update_one(
        {'_id': object_id},
        {'$set': update_data}
    )
    
    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    
    # Fetch the updated user to get their email for the response
    user = users_collection.find_one({'_id': object_id})
    
    action = 'activated' if activate else 'deactivated'
    return jsonify({
        'message': f'User {user["email"]} {action} successfully'
    }), 200

# Get dashboard stats for admin
@admin_bp.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    # Count total users
    total_users = users_collection.count_documents({})
    active_users = users_collection.count_documents({'is_active': True})
    pending_users = users_collection.count_documents({'pending_activation': True})
    
    # Count users by subscription tier
    subscription_stats = {}
    for tier in SUBSCRIPTION_TIERS.keys():
        count = users_collection.count_documents({'subscription.tier': tier})
        subscription_stats[tier] = count
    
    # Count total images
    total_images = images_collection.count_documents({})
    
    # Get user registrations by month (last 6 months)
    now = datetime.now()
    months = []
    registrations_by_month = []
    
    for i in range(5, -1, -1):
        # Get start and end of month
        month_start = datetime(now.year, now.month, 1) - timedelta(days=30*i)
        if i > 0:
            month_end = datetime(now.year, now.month, 1) - timedelta(days=30*(i-1))
        else:
            month_end = datetime(now.year, now.month+1, 1) if now.month < 12 else datetime(now.year+1, 1, 1)
        
        # Format month name
        month_name = month_start.strftime('%b %Y')
        months.append(month_name)
        
        # Count registrations in this month
        count = users_collection.count_documents({
            'created_at': {'$gte': month_start, '$lt': month_end}
        })
        registrations_by_month.append(count)
    
    # Get most used scenes
    pipeline = [
        {"$unwind": "$generated_images"},
        {"$group": {"_id": "$generated_images.scene", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    scene_stats = list(images_collection.aggregate(pipeline))
    scene_stats = [{"scene": item["_id"], "count": item["count"]} for item in scene_stats]
    
    return jsonify({
        'users': {
            'total': total_users,
            'active': active_users,
            'pending': pending_users
        },
        'subscriptions': subscription_stats,
        'images': {
            'total': total_images
        },
        'registrations': {
            'months': months,
            'counts': registrations_by_month
        },
        'scenes': scene_stats
    }), 200

# Create admin user (for initial setup)
@admin_bp.route('/api/admin/setup', methods=['POST'])
def admin_setup():
    # This endpoint should be secured in production with an admin setup token
    # or disabled after first use
    
    # Check if admin users already exist
    admin_count = users_collection.count_documents({'role': 'admin'})
    if admin_count > 0:
        return jsonify({'error': 'Admin users already exist'}), 400
    
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Validate email format
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if email already exists
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'Email already exists'}), 400
    
    # Validate password strength (at least 8 characters with mix of letters, numbers, symbols)
    if (len(password) < 8 or 
        not re.search(r'[A-Z]', password) or 
        not re.search(r'[a-z]', password) or
        not re.search(r'[0-9]', password)):
        return jsonify({'error': 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'}), 400
    
    # Create admin user
    new_admin = {
        'email': email,
        'password_hash': generate_password_hash(password),
        'first_name': data.get('first_name', 'Admin'),
        'last_name': data.get('last_name', 'User'),
        'company_name': data.get('company_name', 'Admin Company'),
        'role': 'admin',
        'is_active': True,
        'pending_activation': False,
        'created_at': datetime.now(),
        'subscription': {
            'tier': 'enterprise',
            'started_at': datetime.now(),
            'next_billing_date': datetime.now() + timedelta(days=365)
        },
        'usage': {
            'images_generated': 0,
            'last_reset': datetime.now()
        }
    }
    
    # Insert admin user
    result = users_collection.insert_one(new_admin)
    
    # Create access token
    access_token = create_access_token(identity=email)
    
    return jsonify({
        'message': 'Admin user created successfully',
        'access_token': access_token
    }), 201

# Modify the login endpoint to handle activation status
@admin_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user
    user = users_collection.find_one({'email': email})
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check if user is pending activation
    if user.get('pending_activation'):
        return jsonify({
            'error': 'Your account is pending activation by an administrator',
            'status': 'pending'
        }), 403
    
    # Check if user is active
    if not user.get('is_active', False):
        return jsonify({
            'error': 'Your account has been deactivated',
            'status': 'inactive'
        }), 403
    
    # Create token with role claim
    additional_claims = {
        'role': user.get('role', 'user')
    }
    
    access_token = create_access_token(
        identity=email,
        additional_claims=additional_claims
    )
    
    return jsonify({
        'access_token': access_token,
        'role': user.get('role', 'user')
    }), 200

# Modify registration endpoint to set pending_activation status
@admin_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    company_name = data.get('company_name', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Check if user exists
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400
    
    # Get the app configuration for activation requirement
    requires_activation = current_app.config.get('REQUIRES_ADMIN_ACTIVATION', True)
    
    # Create user with free tier subscription automatically assigned
    new_user = {
        'email': email,
        'password_hash': generate_password_hash(password),
        'first_name': first_name,
        'last_name': last_name,
        'company_name': company_name,
        'created_at': datetime.now(),
        'role': 'user',  # Default role
        'is_active': not requires_activation,  # Active only if no activation required
        'pending_activation': requires_activation,  # Pending if activation required
        'subscription': {
            'tier': 'free',
            'started_at': datetime.now(),
            'next_billing_date': datetime.now() + timedelta(days=30)
        },
        'usage': {
            'images_generated': 0,
            'last_reset': datetime.now()
        }
    }
    
    # Insert user into database
    result = users_collection.insert_one(new_user)
    
    # Only create token if activation is not required
    if not requires_activation:
        access_token = create_access_token(identity=email)
        return jsonify({
            'access_token': access_token,
            'message': 'Account created with free subscription (10 images)'
        }), 201
    else:
        return jsonify({
            'message': 'Account created. An administrator will review and activate your account.',
            'status': 'pending'
        }), 201