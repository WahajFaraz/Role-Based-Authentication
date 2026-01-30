import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRouter from './components/DashboardRouter';
import EnhancedLogin from './components/EnhancedLogin';
import EnhancedRegister from './components/EnhancedRegister';
import UserForm from './components/UserForm';
import './App.css';

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

/**
 * Main App Component
 * Sets up routing and authentication
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <EnhancedLogin />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <EnhancedRegister />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users/new" 
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users/:id/edit" 
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users/:id" 
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              } 
            />

            {/* Default Routes */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />} 
            />
            
            <Route 
              path="*" 
              element={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100vh',
                  flexDirection: 'column',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>
                    Go to Dashboard
                  </a>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
