# AI Product Visualization Service - Setup Guide

This guide will help you set up the complete AI-powered product visualization service. The system consists of a React frontend, Flask backend, and integration with Google's Gemini APIs.

## Prerequisites

- Python 3.8+
- Node.js 14+
- Google Cloud account with Gemini API access
- Stripe account (for payment processing)

## Backend Setup

1. Create a virtual environment and install dependencies:

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors flask-jwt-extended werkzeug pillow requests google-generativeai stripe
```

2. Create the directory structure:

```bash
mkdir -p uploads processed
```

3. Set up environment variables:

```bash
# Linux/macOS
export FLASK_APP=app.py
export FLASK_ENV=development
export JWT_SECRET_KEY="your-secret-key"
export GEMINI_API_KEY="your-gemini-api-key"
export STRIPE_API_KEY="your-stripe-api-key"

# Windows
set FLASK_APP=app.py
set FLASK_ENV=development
set JWT_SECRET_KEY="your-secret-key"
set GEMINI_API_KEY="your-gemini-api-key"
set STRIPE_API_KEY="your-stripe-api-key"
```

4. Create `app.py` with the backend code provided earlier

5. Run the Flask server:

```bash
flask run
```

## Frontend Setup

1. Create a new React app:

```bash
npx create-react-app product-visualization-frontend
cd product-visualization-frontend
```

2. Install required dependencies:

```bash
npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled
```

3. Set up environment variables by creating a `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Replace the contents of the `src` folder with the provided frontend components

5. Create the component structure:

```bash
mkdir -p src/components src/pages
```

6. Add the provided React components to their respective folders:
   - App.js in src
   - Components like ProductUpload, SceneSelection, etc. in src/pages

7. Run the frontend:

```bash
npm start
```

## Integrating with Google Gemini

1. Set up a Google Cloud account if you don't have one
2. Enable the Gemini API in your Google Cloud Console
3. Create an API key for Gemini
4. Use this key in your backend environment variables

## Deployment

### Backend Deployment (Example for Google Cloud Run)

1. Create a `Dockerfile` in your backend directory:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads processed

CMD exec gunicorn --bind :$PORT app:app
```

2. Create a `requirements.txt` file:

```
flask==2.0.1
flask-cors==3.0.10
flask-jwt-extended==4.3.1
werkzeug==2.0.1
pillow==9.0.0
requests==2.27.1
google-generativeai==0.3.1
stripe==2.65.0
gunicorn==20.1.0
```

3. Deploy to Cloud Run:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/product-visualization-backend
gcloud run deploy product-visualization-backend --image gcr.io/YOUR_PROJECT_ID/product-visualization-backend --platform managed
```

### Frontend Deployment (Example for Netlify)

1. Add a `netlify.toml` file to your frontend directory:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy to Netlify:

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Database Migration

The current implementation uses in-memory storage for simplicity. For production, you should implement a proper database:

1. Install database libraries:

```bash
pip install flask-sqlalchemy psycopg2-binary
```

2. Update the backend code to use SQLAlchemy for database operations
3. Create models for User, Image, and Subscription
4. Set up database migrations

## Monitoring and Analytics

1. Implement logging with a service like Datadog or New Relic
2. Set up API usage monitoring for Gemini to track costs
3. Implement user analytics to understand usage patterns

## Additional Enhancements

1. Implement a more sophisticated background removal service
2. Add image caching for improved performance
3. Implement a queue system for processing large batches of images
4. Add custom model training for specific product categories
5. Implement A/B testing for different AI models

## Security Considerations

1. Implement proper input validation
2. Set up rate limiting
3. Configure CORS properly for production
4. Implement proper error handling and logging
5. Store sensitive API keys in a secure vault

## Documentation

1. Create API documentation with Swagger or similar
2. Develop user guides for different customer segments
3. Create tutorials for common visualization scenarios