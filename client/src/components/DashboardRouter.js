import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import UserProfile from './UserProfile';

/**
 * Dashboard Router Component
 * Routes users to appropriate dashboard based on their role
 */
const DashboardRouter = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        Loading dashboard...
      </div>
    );
  }

  // If not authenticated, this shouldn't happen due to ProtectedRoute
  // but just in case
  if (!isAuthenticated || !user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        Redirecting to login...
      </div>
    );
  }

  // If user is admin, show AdminDashboard
  // If user is normal user, show UserProfile
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <UserProfile />;
  }
};

export default DashboardRouter;
