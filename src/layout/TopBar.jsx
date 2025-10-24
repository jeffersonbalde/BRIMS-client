import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { showAlert, showToast } from "../services/notificationService";
import logo from "../assets/images/logo.png";
import textLogo from "../assets/images/text-logo-no-bg.png";

const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Reset loading states when user changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarLoading(true);
      setAvatarError(false);
    }
  }, [user?.avatar]);

  // Function to handle navigation and close dropdown
  const handleNavigation = (path) => {
    navigate(path);
    // Close the dropdown by triggering a click on the document body
    document.body.click();
  };

  const handleLogout = async () => {
    // First confirmation dialog - blocks background interaction
    const result = await showAlert.confirm(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      "Yes, Logout",
      "Cancel"
    );

    if (result.isConfirmed) {
      // Show logging out indicator that blocks background interaction
      showAlert.loading(
        "Logging out...",
        "Please wait while we securely log you out",
        {
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          showConfirmButton: false,
        }
      );

      // Disable topbar interactions temporarily
      disableTopbarInteractions();

      // Simulate logout process with a delay
      setTimeout(async () => {
        try {
          await logout();

          // Close the loading alert
          showAlert.close();

          // Show success message
          showToast.success("You have been logged out successfully");
        } catch (error) {
          // Close the loading alert in case of error
          showAlert.close();

          // Re-enable topbar interactions
          enableTopbarInteractions();

          // Show error message
          showAlert.error(
            "Logout Error",
            "There was a problem logging out. Please try again."
          );
          console.error("Logout error:", error);
        }
      }, 1500);
    }
  };

  // Function to disable topbar interactions
  const disableTopbarInteractions = () => {
    const topbarElements = document.querySelectorAll(
      ".sb-topnav button, .sb-topnav a, .sb-topnav input, .sb-topnav .dropdown-toggle"
    );
    topbarElements.forEach((element) => {
      element.style.pointerEvents = "none";
      element.style.opacity = "0.6";
      element.setAttribute("disabled", "true");
    });
  };

  // Function to enable topbar interactions
  const enableTopbarInteractions = () => {
    const topbarElements = document.querySelectorAll(
      ".sb-topnav button, .sb-topnav a, .sb-topnav input, .sb-topnav .dropdown-toggle"
    );
    topbarElements.forEach((element) => {
      element.style.pointerEvents = "auto";
      element.style.opacity = "1";
      element.removeAttribute("disabled");
    });
  };

  const handleImageLoad = () => {
    setAvatarLoading(false);
    setAvatarError(false);
  };

  const handleImageError = () => {
    setAvatarLoading(false);
    setAvatarError(true);
  };

  return (
    <nav className="sb-topnav navbar navbar-expand navbar-dark">
      {/* Navbar Brand - Using image logo */}
      <a
        className="navbar-brand ps-3 ps-sm-4 d-flex align-items-center"
        href="#!"
      >
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: "fit-content",
            gap: "0.3rem",
          }}
        >
          {/* Logo Image - Visible on both mobile and desktop */}
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: "35px",
            }}
          >
            <img
              src={logo}
              alt="Barangay Logo"
              style={{
                width: "35px",
                height: "35px",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Text Logo Image - Desktop with subtitle */}
          <div className="d-none d-md-block">
            <div
              className="d-flex flex-column justify-content-center align-items-start"
              style={{
                width: "100px",
              }}
            >
              <img
                src={textLogo}
                alt="Barangay Monitoring System"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  marginBottom: "2px",
                }}
              />
              <p
                className="m-0"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "10px",
                  lineHeight: "1.1",
                  fontWeight: "500",
                  textAlign: "left",
                }}
              >
                Real-Time Incident Monitoring
              </p>
            </div>
          </div>

          {/* Mobile: Text Logo Image Only (no subtitle) */}
          <div className="d-md-none">
            <div
              className="d-flex justify-content-center align-items-start"
              style={{
                width: "100px",
              }}
            >
              <img
                src={textLogo}
                alt="Barangay Monitoring System"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
      </a>

      {/* Sidebar Toggle */}
      <button
        className="btn btn-link btn-sm order-1 order-lg-0 me-2 me-lg-0"
        id="sidebarToggle"
        onClick={onToggleSidebar}
        style={{ color: "var(--background-white)" }}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Search Form */}
      <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
        <div className="input-group">
          <input
            className="form-control"
            type="text"
            placeholder="Search incidents..."
            aria-label="Search"
            aria-describedby="btnNavbarSearch"
          />
          <button
            className="btn btn-primary"
            id="btnNavbarSearch"
            type="button"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </form>

      {/* User Dropdown */}
      <ul className="navbar-nav ms-auto ms-md-0 me-2 me-lg-3">
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle d-flex align-items-center"
            id="navbarDropdown"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {/* Avatar Container */}
            <div className="position-relative me-2">
              {/* Skeleton Loading - Shows while image is loading */}
              {avatarLoading && user?.avatar && (
                <div
                  className="rounded-circle skeleton"
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    animation: "skeleton-pulse 1.5s ease-in-out infinite",
                  }}
                ></div>
              )}

              {/* Actual Avatar Image */}
              {user?.avatar && !avatarError && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-circle"
                  style={{
                    width: "32px",
                    height: "32px",
                    objectFit: "cover",
                    display: avatarLoading ? "none" : "block",
                    transition: "opacity 0.3s ease",
                    opacity: avatarLoading ? 0 : 1,
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}

              {/* Fallback Avatar - Shows when no avatar or error */}
              {(!user?.avatar || avatarError) && (
                <div
                  className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: "32px", 
                    height: "32px",
                    opacity: avatarLoading ? 0.6 : 1,
                    transition: "opacity 0.3s ease"
                  }}
                >
                  <i
                    className="fas fa-user text-dark"
                    style={{ fontSize: "14px" }}
                  ></i>
                </div>
              )}
            </div>
            
            <span className="d-none d-lg-inline">{user?.name}</span>
          </a>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="navbarDropdown"
          >
            <li>
              <div className="dropdown-header">
                <strong>{user?.name}</strong>
                <div className="small text-muted">{user?.email}</div>
                <div className="small text-muted">Role: {user?.role}</div>
              </div>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            {/* Profile Link */}
            <li>
              <button 
                className="dropdown-item custom-dropdown-item" 
                onClick={() => handleNavigation("/profile")}
              >
                <i className="fas fa-user me-2"></i>Profile
              </button>
            </li>
            {/* Settings Link */}
            <li>
              <button 
                className="dropdown-item custom-dropdown-item" 
                onClick={() => handleNavigation("/settings")}
              >
                <i className="fas fa-cog me-2"></i>Settings
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            {/* Logout Button - UPDATED with better hover effect */}
            <li>
              <button
                className="dropdown-item custom-dropdown-item logout-item"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt me-2"></i>Logout
              </button>
            </li>
          </ul>
        </li>
      </ul>

      {/* Custom CSS for dropdown hover effects */}
      <style jsx>{`
        .custom-dropdown-item {
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          padding: 0.375rem 1rem;
          color: #212529;
          transition: all 0.15s ease-in-out;
        }

        .custom-dropdown-item:hover {
          background-color: #f8f9fa;
          color: #16181b;
        }

        .custom-dropdown-item:focus {
          background-color: #f8f9fa;
          color: #16181b;
          outline: none;
        }

        /* UPDATED: Better logout button hover effect */
        .logout-item {
          color: #dc3545 !important;
        }

        .logout-item:hover {
          background-color: rgba(220, 53, 69, 0.1) !important;
          color: #dc3545 !important;
        }

        .logout-item:focus {
          background-color: rgba(220, 53, 69, 0.1) !important;
          color: #dc3545 !important;
          outline: none;
        }

        /* Ensure the dropdown items have proper spacing and alignment */
        .dropdown-menu .custom-dropdown-item {
          display: block;
          clear: both;
          font-weight: 400;
          text-decoration: none;
          white-space: nowrap;
          border: 0;
        }

        /* Restore Bootstrap-like hover transitions */
        .dropdown-menu {
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 0.375rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .dropdown-menu .custom-dropdown-item:active {
          background-color: #0d6efd;
          color: white;
        }
      `}</style>
    </nav>
  );
};

export default TopBar;