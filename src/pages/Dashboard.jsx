// Dashboard.jsx - UPDATED
import { useAuth } from "../contexts/AuthContext";
import Layout from "../layout/Layout";
import AdminDashboard from "./admin/AdminDashboard";
import BarangayDashboard from "./barangay/dashboards/BarangayDashboard";
import PendingApproval from "./barangay/dashboards/PendingApproval";
import RejectedUser from "./barangay/dashboards/RejectedUser";

const Dashboard = () => {
  const { user, isAdmin, isBarangay, isApproved, isPending } = useAuth();

  // Show appropriate component based on user status
  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isBarangay) {
    if (user?.status === "rejected") {
      return <RejectedUser />;
    }

    if (isPending) {
      return <PendingApproval />;
    }

    if (isApproved) {
      return <BarangayDashboard />;
    }
  }

  // Fallback for unexpected states
  return (
    <div className="alert alert-warning">
      <h4>Account Status Unknown</h4>
      <p>Please contact system administrator.</p>
    </div>
  );
};

export default Dashboard;
