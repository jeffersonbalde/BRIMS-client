// components/ProtectedRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingAuthentication from './LoadingAuthentication';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingAuthentication />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;