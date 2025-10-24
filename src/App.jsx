// App.jsx - ADD THESE ROUTES
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from "./services/notificationService";
import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./pages/Login";
import About from "./pages/About";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/profile"; // ADD THIS IMPORT
import Settings from "./pages/setting"; // ADD THIS IMPORT
import LoadingAuthentication from "./components/LoadingAuthentication";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./pages/NotFound";
import Approvals from "./pages/admin/Approvals";
import Layout from "./layout/Layout";

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

        {/* Protected Routes - Accessible to all authenticated users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* PROFILE ROUTE - Accessible to ALL authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile /> {/* Your Profile component */}
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* SETTINGS ROUTE - Accessible to ALL authenticated users */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings /> {/* Your Settings component */}
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/admin/approvals"
          element={
            <AdminRoute>
              <Layout>
                <Approvals />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Add more admin routes as you create them */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Layout>
                <div>Admin Page - Coming Soon</div>
              </Layout>
            </AdminRoute>
          }
        />

        {/* Barangay Only Routes */}
        <Route
          path="/barangay/*"
          element={
            <ProtectedRoute>
              <Layout>
                <div>Barangay Page - Coming Soon</div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/about" element={<About />} />

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