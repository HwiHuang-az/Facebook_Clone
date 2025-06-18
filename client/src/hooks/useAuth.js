import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add token to all requests
axios.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/me');
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        Cookies.remove('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      // Store token in cookie (7 days)
      Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      
      setUser(user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { user, token } = response.data.data;

      // Store token in cookie
      Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      
      setUser(user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/users/profile', userData);
      setUser(response.data.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 