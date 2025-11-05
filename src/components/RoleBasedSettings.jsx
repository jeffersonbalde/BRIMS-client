// components/RoleBasedSettings.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import AdminSettings from "../pages/admin/AdminSettings";
import BarangaySettings from "../pages/barangay/settings/BarangaySettings";

const RoleBasedSettings = () => {
  const { isAdmin, isBarangay } = useAuth();

  if (isAdmin) {
    return <AdminSettings />;
  }

  if (isBarangay) {
    return <BarangaySettings />;
  }

  return <div>Unauthorized</div>;
};

export default RoleBasedSettings;
