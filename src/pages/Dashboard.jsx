// Dashboard.jsx
import { useAuth } from "../contexts/AuthContext";
import Layout from "../layout/Layout";
import AdminDashboard from "./AdminDashboard";
import BarangayDashboard from "./BarangayDashboard";
import PendingApproval from "./PendingApproval";

const Dashboard = () => {
  const { user, isAdmin, isBarangay, isApproved, isPending } = useAuth();

  // Show pending approval message for barangay users waiting for approval
  if (isPending) {
    return (
      <Layout>
        <PendingApproval />
      </Layout>
    );
  }

  // Show appropriate dashboard based on role and approval status
  return (
    <Layout>
      {isAdmin && <AdminDashboard />}
      {isBarangay && isApproved && <BarangayDashboard />}
      
      {/* Fallback for unexpected states */}
      {!isAdmin && !isBarangay && (
        <div className="alert alert-warning">
          <h4>Account Status Unknown</h4>
          <p>Please contact system administrator.</p>
          <p><strong>User Role:</strong> {user?.role}</p>
          <p><strong>Approved:</strong> {user?.is_approved ? 'Yes' : 'No'}</p>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;