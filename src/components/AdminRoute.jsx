// components/AdminRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingAuthentication from './LoadingAuthentication';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingAuthentication />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect to dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;