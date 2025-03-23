# AI Product Visualization API Documentation

This document provides information about the RESTful API endpoints available for the AI Product Visualization Service.

## Base URL

```
https://api.productvisualize.ai/v1
```

## Authentication

All API requests require authentication using a JSON Web Token (JWT). To authenticate, include the token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Getting a Token

To obtain a token, use the login endpoint with your credentials.

## API Endpoints

### Authentication

#### Register a new user

```
POST /auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "ACME Inc."
}
```

Response:
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```
POST /auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Subscription Management

#### Get available subscription plans

```
GET /subscriptions
```

Response:
```json
{
  "starter": {
    "price": 49,
    "images_per_month": 20,
    "features": ["Basic scenes", "Standard resolution"]
  },
  "business": {
    "price": 149,
    "images_per_month": 100,
    "features": ["Advanced scenes", "High resolution"]
  },
  "enterprise": {
    "price": 499,
    "images_per_month": 500,
    "features": ["Custom backgrounds", "Priority processing"]
  }
}
```

#### Get current subscription

```
GET /subscription
```

Response:
```json
{
  "subscription": {
    "tier": "business",
    "started_at": "2023-05-15T10:30:45Z",
    "next_billing_date": "2023-06-15T10:30:45Z",
    "tier_details": {
      "price": 149,
      "images_per_month": 100,
      "features": ["Advanced scenes", "High resolution"]
    },
    "usage": {
      "images_generated": 42
    }
  }
}
```

#### Subscribe to a plan

```
POST /subscribe
```

Request body:
```json
{
  "tier": "business",
  "payment_method_id": "pm_1234567890"
}
```

Response:
```json
{
  "message": "Successfully subscribed to business tier",
  "subscription": {
    "tier": "business",
    "started_at": "2023-05-15T10:30:45Z",
    "next_billing_date": "2023-06-15T10:30:45Z"
  }
}
```

### Product Visualization

#### Upload a product image

```
POST /upload
```

Request:
- Content-Type: multipart/form-data
- Form field: `file` (the image file)

Response:
```json
{
  "image_id": "5f8d3a9b7c6e5d4b3a2c1d0e",
  "message": "Image uploaded and processed successfully"
}
```

#### Get available scene templates

```
GET /scenes
```

Response:
```json
{
  "scenes": {
    "living_room": "A modern living room with natural lighting",
    "kitchen": "A spacious kitchen with marble countertops",
    "office": "A professional office setting with a desk and chair",
    "outdoor": "An outdoor patio with greenery",
    "bedroom": "A cozy bedroom with contemporary furniture",
    "bathroom": "A clean bathroom with white tiles"
  }
}
```

#### Generate a visualization

```
POST /generate
```

Request body:
```json
{
  "image_id": "5f8d3a9b7c6e5d4b3a2c1d0e",
  "scene": "living_room",
  "custom_prompt": ""
}
```

For custom scenes:
```json
{
  "image_id": "5f8d3a9b7c6e5d4b3a2c1d0e",
  "scene": "custom",
  "custom_prompt": "A minimalist Scandinavian living room with large windows and wooden flooring"
}
```

Response:
```json
{
  "generated_id": "1a2b3c4d5e6f7g8h9i0j",
  "message": "Image generated successfully",
  "remaining_images": 58
}
```

#### Get all user images

```
GET /images
```

Response:
```json
{
  "images": [
    {
      "id": "5f8d3a9b7c6e5d4b3a2c1d0e",
      "created_at": "2023-05-15T14:22:36Z",
      "generated_images": [
        {
          "id": "1a2b3c4d5e6f7g8h9i0j",
          "path": "processed/generated_1a2b3c4d5e6f7g8h9i0j.png",
          "scene": "living_room",
          "prompt": "A modern living room with natural lighting",
          "created_at": "2023-05-15T14:25:12Z"
        }
      ]
    }
  ]
}
```

#### Get a specific image

```
GET /images/:image_id
```

Response:
```json
{
  "image": {
    "id": "5f8d3a9b7c6e5d4b3a2c1d0e",
    "owner": "user@example.com",
    "original_path": "uploads/unique_filename.jpg",
    "processed_path": "processed/processed_unique_filename.png",
    "created_at": "2023-05-15T14:22:36Z",
    "generated_images": [
      {
        "id": "1a2b3c4d5e6f7g8h9i0j",
        "path": "processed/generated_1a2b3c4d5e6f7g8h9i0j.png",
        "scene": "living_room",
        "prompt": "A modern living room with natural lighting",
        "created_at": "2023-05-15T14:25:12Z"
      }
    ]
  }
}
```

#### Download a generated image

```
GET /images/:image_id/download/:generated_id
```

Response:
- Content-Type: image/png
- The image file as binary data

#### Delete an image

```
DELETE /images/:image_id
```

Response:
```json
{
  "message": "Image deleted successfully"
}
```

### Advanced Features

#### Batch processing

```
POST /batch
```

Request body:
```json
{
  "images": [
    {
      "image_id": "5f8d3a9b7c6e5d4b3a2c1d0e",
      "scene": "living_room"
    },
    {
      "image_id": "6g7h8i9j0k1l2m3n4o5p",
      "scene": "kitchen"
    }
  ],
  "priority": "normal"
}
```

Response:
```json
{
  "batch_id": "batch_1234567890",
  "status": "processing",
  "estimated_completion_time": "2023-05-15T15:30:00Z"
}
```

#### Check batch status

```
GET /batch/:batch_id
```

Response:
```json
{
  "batch_id": "batch_1234567890",
  "status": "completed",
  "results": [
    {
      "image_id": "5f8d3a9b7c6e5d4b3a2c1d0e",
      "generated_id": "1a2b3c4d5e6f7g8h9i0j",
      "status": "success"
    },
    {
      "image_id": "6g7h8i9j0k1l2m3n4o5p",
      "generated_id": "2b3c4d5e6f7g8h9i0j1k",
      "status": "success"
    }
  ]
}
```

#### Generate scene variants

```
POST /variants
```

Request body:
```json
{
  "image_id": "5f8d3a9b7c6e5d4b3a2c1d0e",
  "base_scene": "living_room",
  "variations": [
    "with a cat on the sofa",
    "with decorative plants",
    "with evening lighting"
  ]
}
```

Response:
```json
{
  "variant_ids": [
    "3c4d5e6f7g8h9i0j1k2l",
    "4d5e6f7g8h9i0j1k2l3m",
    "5e6f7g8h9i0j1k2l3m4n"
  ],
  "message": "Variants generated successfully",
  "remaining_images": 55
}
```

### Analytics

#### Get usage statistics

```
GET /analytics/usage
```

Response:
```json
{
  "total_images": 42,
  "usage_by_month": [
    {
      "month": "2023-04",
      "count": 15
    },
    {
      "month": "2023-05",
      "count": 27
    }
  ],
  "usage_by_scene": {
    "living_room": 18,
    "kitchen": 12,
    "office": 5,
    "custom": 7
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Invalid parameters. Please check your request."
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required. Please log in."
}
```

### 403 Forbidden

```json
{
  "error": "You don't have permission to access this resource."
}
```

### 404 Not Found

```json
{
  "error": "Resource not found."
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retry_after": 30
}
```

### 500 Internal Server Error

```json
{
  "error": "An unexpected error occurred. Please try again later."
}
```

## Webhooks

The API can send webhook notifications for various events. Configure your webhook URL in your account settings.

### Events

- `image.uploaded`: Triggered when a new image is uploaded
- `image.generated`: Triggered when a visualization is generated
- `batch.completed`: Triggered when a batch job is completed
- `subscription.created`: Triggered when a subscription is created
- `subscription.updated`: Triggered when a subscription is updated
- `subscription.canceled`: Triggered when a subscription is canceled

### Webhook Payload Example

```json
{
  "event": "image.generated",
  "created_at": "2023-05-15T14:25:12Z",
  "data": {
    "image_id": "5f8d3a9b7c6e5d4b3a2c1d0e",
    "generated_id": "1a2b3c4d5e6f7g8h9i0j",
    "scene": "living_room"
  }
}
```

## Rate Limits

- Free trial: 10 requests per minute
- Starter plan: 30 requests per minute
- Business plan: 60 requests per minute
- Enterprise plan: 120 requests per minute

When rate limit is exceeded, the API returns a 429 Too Many Requests status code with the Retry-After header indicating the number of seconds to wait before retrying.

## SDKs and Client Libraries

Official client libraries are available for:

- JavaScript/TypeScript
- Python
- PHP
- Ruby
- Java

Visit our [GitHub repository](https://github.com/productvisualize/api-clients) for installation instructions and code examples.