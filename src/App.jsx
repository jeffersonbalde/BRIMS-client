// App.jsx - Fixed version
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from "./services/notificationService";
import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./pages/Login";
import About from "./pages/About";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LoadingAuthentication from "./components/LoadingAuthentication";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./pages/NotFound";

// AppRoutes component to handle routing with auth
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
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div>Profile Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div>Settings Page - Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/about" element={<About />} />
        
        {/* 404 Route - FIXED: This route should not be wrapped in any auth component */}
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
        // User is logged in - skip loading screen entirely
        setShowLoadingScreen(false);
        setAppReady(true);
      } else {
        // User is not logged in - show loading screen briefly
        const timer = setTimeout(() => {
          setShowLoadingScreen(false);
          setAppReady(true);
        }, 5500);

        return () => clearTimeout(timer);
      }
    };

    initializeApp();
  }, []);

  // Show loading screen only for non-authenticated first-time visitors
  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  // Show main app when ready
  return (
    <AuthProvider>
      <BrowserRouter>
        {appReady && <AppRoutes />}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;