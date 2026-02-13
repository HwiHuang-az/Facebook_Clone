import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(Cookies.get('token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = Cookies.get('token');
      
      if (!storedToken) {
        setToken(null);
        setLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        Cookies.remove('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      // Store token in cookie (7 days)
      Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;

      // Store token in cookie
      Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      setUser(response.data.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
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
    token,
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