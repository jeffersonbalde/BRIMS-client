// pages/NotFound.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const NotFound = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show loading for 404 pages
  if (loading) {
    return null;
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? "/dashboard" : "/");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 text-center">
            
            {/* 404 Number */}
            <div className="mb-4">
              <h1 
                className="display-1 fw-bold mb-0"
                style={{ color: 'var(--primary-color)' }}
              >
                404
              </h1>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h2 
                className="h3 fw-bold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                Page Not Found
              </h2>
              
              <p 
                className="mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                The page you're looking for doesn't exist or has been moved.
              </p>
              
              <p 
                className="small text-muted mb-0"
              >
                Attempted URL: <code className="bg-white px-2 py-1 rounded border">{location.pathname}</code>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button
                onClick={handleGoBack}
                className="btn btn-primary px-4"
                style={{
                  backgroundColor: 'var(--btn-primary-bg)',
                  borderColor: 'var(--btn-primary-bg)'
                }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Go Back
              </button>
              
              <button
                onClick={handleGoHome}
                className="btn btn-outline-secondary px-4"
              >
                {isAuthenticated ? (
                  <>
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;