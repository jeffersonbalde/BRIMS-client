// components/PublicRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingAuthentication from './LoadingAuthentication';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingAuthentication />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;