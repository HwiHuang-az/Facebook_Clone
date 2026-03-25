import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SocketProvider } from './hooks/useSocket';
import { Toaster } from 'react-hot-toast';


// Pages
const Login = React.lazy(() => import('./pages/Login'));
const Home = React.lazy(() => import('./pages/Home'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Friends = React.lazy(() => import('./pages/Friends'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Watch = React.lazy(() => import('./pages/Watch'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const Groups = React.lazy(() => import('./pages/Groups'));
const Pages = React.lazy(() => import('./pages/Pages'));
const SavedPostsPage = React.lazy(() => import('./pages/SavedPostsPage'));
const PrivacySettingsPage = React.lazy(() => import('./pages/PrivacySettingsPage'));
const EventsPage = React.lazy(() => import('./pages/EventsPage'));
const GroupDetail = React.lazy(() => import('./pages/GroupDetail'));
const PageDetail = React.lazy(() => import('./pages/PageDetail'));
const EventDetail = React.lazy(() => import('./pages/EventDetail'));
const Search = React.lazy(() => import('./pages/Search'));
const NotFound = React.lazy(() => import('./pages/NotFound'));



// Components
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/UI/LoadingScreen';
import ErrorBoundary from './components/Shared/ErrorBoundary';

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
      <React.Suspense fallback={<LoadingScreen />}>
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
                <Layout fullWidth={true}>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/friends/*" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
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
                <Layout fullWidth={true}>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/events/:id" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <EventDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events/*" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <EventsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <Search />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/pages" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <Pages />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/saved" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <SavedPostsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pages/:id" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <PageDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />

          
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <Groups />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups/:id" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <GroupDetail />
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
                <Layout fullWidth={true}>
                  <PrivacySettingsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/saved" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <SavedPostsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings/*" 
            element={
              <ProtectedRoute>
                <Layout fullWidth={true}>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App; 