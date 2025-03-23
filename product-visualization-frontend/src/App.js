import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductUpload from './pages/ProductUpload';
import SceneSelection from './pages/SceneSelection';
import ImageGallery from './pages/ImageGallery';
import Subscription from './pages/Subscription';
import ImageDetail from './pages/ImageDetail';

// Styles
import './App.css';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      
      // Fetch user data
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const subscriptionRes = await axios.get('/subscription');
      setUser({ subscription: subscriptionRes.data.subscription });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    fetchUserData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} logout={logout} />
        <main className="content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login login={login} />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register login={login} />} 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <ProductUpload user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scenes/:imageId" 
              element={
                <ProtectedRoute>
                  <SceneSelection user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gallery" 
              element={
                <ProtectedRoute>
                  <ImageGallery user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <Subscription user={user} fetchUserData={fetchUserData} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/images/:imageId" 
              element={
                <ProtectedRoute>
                  <ImageDetail user={user} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <footer className="footer">
          <p>© {new Date().getFullYear()} AI Product Visualization Service</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;