// components/RoleBasedProfile.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminProfile from '../pages/admin/AdminProfile';
import BarangayProfile from '../pages/barangay/profile/BarangayProfile';

const RoleBasedProfile = () => {
  const { isAdmin, isBarangay } = useAuth();

  if (isAdmin) {
    return <AdminProfile />;
  }

  if (isBarangay) {
    return <BarangayProfile />;
  }

  return <div>Unauthorized</div>;
};

export default RoleBasedProfile;