import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SocketProvider } from './hooks/useSocket';
import { Toaster } from 'react-hot-toast';


// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Watch from './pages/Watch';
import Marketplace from './pages/Marketplace';
import Groups from './pages/Groups';
import Pages from './pages/Pages';
import SavedPostsPage from './pages/SavedPostsPage';
import PrivacySettingsPage from './pages/PrivacySettingsPage';
import EventsPage from './pages/EventsPage';



// Components
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/UI/LoadingScreen';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/:userId?" 
          element={
            <ProtectedRoute>
              <Layout hideSidebar={true}>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/friends/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Friends />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/messages/*" 
          element={
            <ProtectedRoute>
              <Layout fullWidth={true}>
                <Messages />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/events/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <EventsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pages/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Pages />
              </Layout>
            </ProtectedRoute>
          } 
        />

        
        <Route 
          path="/groups/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Groups />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/marketplace/*" 
          element={
            <ProtectedRoute>
              <Layout fullWidth={true}>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/watch/*" 
          element={
            <ProtectedRoute>
              <Layout fullWidth={true}>
                <Watch />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings/privacy" 
          element={
            <ProtectedRoute>
              <Layout>
                <PrivacySettingsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/saved" 
          element={
            <ProtectedRoute>
              <Layout>
                <SavedPostsPage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="App font-segoe bg-gray-100 min-h-screen">
          <AppRoutes />

        
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              maxWidth: '400px',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
            },
          }}
        />
      </div>
      </SocketProvider>
    </AuthProvider>

  );
}

export default App; 