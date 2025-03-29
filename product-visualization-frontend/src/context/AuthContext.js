// In AuthContext.js or similar
const login = async (token) => {
    localStorage.setItem('token', token);
    
    try {
      // Decode the JWT to get the role (if you're using JWT)
      const decoded = decodeJwt(token);
      setUser({
        ...decoded,
        role: decoded.role || 'user' // Default to 'user' if no role specified
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      logout();
    }
  };