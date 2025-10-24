// components/BarangayRoute.jsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingAuthentication from './LoadingAuthentication';

const BarangayRoute = ({ children }) => {
  const { isAuthenticated, isBarangay, isApproved, loading } = useAuth();

  if (loading) {
    return <LoadingAuthentication />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Only approved barangay users can access
  if (!isBarangay || !isApproved) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default BarangayRoute;