// App.jsx - FIXED ROUTES (No conflicts)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from "./services/notificationService";
import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Dashboard from "./pages/Dashboard";
import RoleBasedProfile from "./components/RoleBasedProfile";
import RoleBasedSettings from "./components/RoleBasedSettings";
import LoadingAuthentication from "./components/LoadingAuthentication";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./pages/public/NotFound";
import Approvals from "./pages/admin/Approvals";
import Layout from "./layout/Layout";
import Notifications from "./pages/admin_barangay/Notifications";


// Import new admin components
import IncidentAnalytics from "./pages/admin/analytics/IncidentAnalytics";
import UserManagement from "./pages/admin/user_management/UserManagement";
import MunicipalPopulation from "./pages/admin/municipal_population/MunicipalPopulation";

import PopulationData from "./pages/admin/population_data/PopulationData";

import MunicipalReports from "./pages/admin/municipal_reports/MunicipalReports";

// Import new barangay components  
import PopulationOverview from "./pages/barangay/population/PopulationOverview";
import AffectedPopulation from "./pages/barangay/population/AffectedPopulation";
import BarangayAnalytics from "./pages/barangay/analytics/BarangayAnalytics";
import GenerateReports from "./pages/barangay/reports/GenerateReports";

// Import ROLE-BASED components
import AdminIncidentManagement from "./pages/admin/Incidents/IncidentManagement";
import BarangayIncidentList from "./pages/barangay/Incidents/IncidentList";

// Role-based component selector
const RoleBasedIncidents = () => {
  const { isAdmin } = useAuth();
  
  if (isAdmin) {
    return <AdminIncidentManagement />;
  } else {
    return <BarangayIncidentList />;
  }
};

const RoleBasedDashboard = () => {
  const { isAdmin, isBarangay } = useAuth();
  
  // You can create different dashboard components for each role
  return <Dashboard />;
};


// Role-based component selectors for new routes
const RoleBasedIncidentAnalytics = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <IncidentAnalytics /> : <BarangayAnalytics />;
};

const RoleBasedPopulation = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <PopulationData  /> : <PopulationOverview />;
};

const RoleBasedReports = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <MunicipalReports /> : <GenerateReports />;
};

const RoleBasedAnalytics = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <IncidentAnalytics /> : <BarangayAnalytics />;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingAuthentication />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        
        {/* Protected Routes - Role-based components */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleBasedDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* INCIDENTS - Single route, different components based on role */}
        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleBasedIncidents />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* PROFILE ROUTE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleBasedProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* SETTINGS ROUTE */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleBasedSettings />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* ADMIN ONLY ROUTES */}
        <Route
          path="/approvals"
          element={
            <AdminRoute>
              <Layout>
                <Approvals />
              </Layout>
            </AdminRoute>
          }
        />
        
        
        {/* BARANGAY ONLY ROUTES */}
        <Route
          path="/report-incident"
          element={
            <ProtectedRoute>
              <Layout>
                <div>Report Incident Form - Coming Soon</div>
              </Layout>
            </ProtectedRoute>
          }
        />



        {/* ADMIN ONLY ROUTES */}
<Route
  path="/users"
  element={
    <AdminRoute>
      <Layout>
        <UserManagement />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path="/incident-analytics"
  element={
    <AdminRoute>
      <Layout>
        <IncidentAnalytics />
      </Layout>
    </AdminRoute>
  }
/>


{/* BARANGAY ONLY ROUTES */}
<Route
  path="/population"
  element={
    <AdminRoute>
      <Layout>
        <PopulationData />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path="/affected-population"
  element={
    <ProtectedRoute>
      <Layout>
        <AffectedPopulation />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <AdminRoute>
      <Layout>
        <BarangayAnalytics />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path="/reports"
  element={
    <ProtectedRoute>
      <Layout>
        <RoleBasedReports />
      </Layout>
    </ProtectedRoute>
  }
/>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

function App() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = () => {
      const token = localStorage.getItem("access_token");

      if (token) {
        setShowLoadingScreen(false);
        setAppReady(true);
      } else {
        const timer = setTimeout(() => {
          setShowLoadingScreen(false);
          setAppReady(true);
        }, 5500);

        return () => clearTimeout(timer);
      }
    };

    initializeApp();
  }, []);

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>{appReady && <AppRoutes />}</BrowserRouter>
    </AuthProvider>
  );
}

export default App;