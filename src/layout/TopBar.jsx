import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { showAlert, showToast } from "../services/notificationService";
import logo from "../assets/images/logo.png";
import textLogo from "../assets/images/text-logo-no-bg.png";

// FIXED: NotificationDropdown component moved outside to prevent recreation
const NotificationDropdown = ({ unreadCount, onNavigate }) => {
  const { token } = useAuth();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // FIX: Simplified fetch function without problematic dependencies
  const fetchRecentNotifications = useCallback(async () => {
    if (hasFetched) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentNotifications(data.notifications || []);
        setHasFetched(true);
      }
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
      setRecentNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, hasFetched]);

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString("en-US", { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getNotificationIcon = (type) => {
    const icons = {
      incident_reported: "fa-exclamation-triangle",
      incident_status_changed: "fa-sync-alt",
      registration_approved: "fa-user-check",
      registration_rejected: "fa-user-times",
      admin_alert: "fa-bullhorn"
    };
    return icons[type] || "fa-bell";
  };

  // FIXED: Handle notification click - ONLY navigate, don't mark as read
  const handleNotificationClick = (notificationId) => {
    console.log("Notification clicked:", notificationId);
    
    // Close dropdown and navigate to notifications page
    document.body.click();
    setTimeout(() => {
      onNavigate("/notifications");
    }, 100);
  };

  // FIXED: Handle view all click
  const handleViewAllClick = () => {
    console.log("View All clicked");
    document.body.click();
    setTimeout(() => {
      onNavigate("/notifications");
    }, 100);
  };

  return (
    <ul 
      className="dropdown-menu dropdown-menu-end" 
      style={{ 
        minWidth: "320px", 
        maxWidth: "320px",
        maxHeight: "400px", 
        overflowY: "auto",
        overflowX: "hidden",
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: "0.375rem",
        boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        whiteSpace: "normal"
      }}
      onMouseEnter={fetchRecentNotifications}
    >
      {/* FIXED: Better header with proper contrast */}
      <li>
        <div className="dropdown-header d-flex justify-content-between align-items-center custom-dropdown-header" style={{ marginTop: '-0.5rem'}}>
          <span className="fw-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="badge custom-notification-badge">
              {unreadCount} new
            </span>
          )}
        </div>
      </li>
      
      {loading ? (
        <li>
          <div className="dropdown-item-text text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            <small>Loading notifications...</small>
          </div>
        </li>
      ) : recentNotifications.length === 0 ? (
        <li>
          <div className="dropdown-item-text text-center py-4 text-muted">
            <i className="fas fa-bell-slash fa-lg mb-2 d-block custom-bell-icon"></i>
            <small className="d-block">No notifications</small>
            <small className="text-muted">You're all caught up!</small>
          </div>
        </li>
      ) : (
        recentNotifications.slice(0, 5).map((notification) => (
          <li key={notification.id}>
            {/* FIXED: Changed to button and added click handler */}
            <button 
              className="dropdown-item d-flex align-items-start py-2 custom-notification-item w-100 text-start border-0 bg-transparent"
              onClick={() => handleNotificationClick(notification.id)}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                wordWrap: "break-word",
                overflowWrap: "break-word",
                paddingLeft: '1rem', // FIXED: Added left padding to notification items
                paddingRight: '1.5rem' // FIXED: Increased right padding to prevent text overlap
              }}
            >
              <div className="flex-shrink-0 me-2 mt-1">
                <i 
                  className={`fas ${getNotificationIcon(notification.type)}`}
                  style={{ 
                    color: "var(--primary-color)",
                    fontSize: "0.9rem"
                  }}
                ></i>
              </div>
              <div className="flex-grow-1" style={{ 
                minWidth: 0,
                paddingRight: "0.5rem" // FIXED: Additional padding for content area
              }}>
                <div 
                  className="small fw-semibold text-dark"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word"
                  }}
                >
                  {notification.title}
                </div>
                <div 
                  className="small text-muted"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    maxWidth: "100%"
                  }}
                >
                  {notification.message}
                </div>
                <div className="small text-muted">
                  {formatNotificationTime(notification.created_at)}
                </div>
              </div>
              {!notification.is_read && (
                <span 
                  className="badge bg-primary rounded-pill ms-2 mt-1 flex-shrink-0"
                  style={{ 
                    fontSize: "0.5rem",
                    width: "8px",
                    height: "8px",
                    padding: "0"
                  }}
                  title="Unread"
                ></span>
              )}
            </button>
          </li>
        ))
      )}
      
      <li>
        <hr className="dropdown-divider my-1" />
      </li>
      {/* FIXED: Light background with primary color relation */}
      <li>
        <button 
          className="dropdown-item text-center fw-semibold py-2 custom-view-all-btn"
          onClick={handleViewAllClick}
          style={{
            backgroundColor: "rgba(13, 110, 253, 0.08)",
            color: "var(--primary-color)",
            border: "1px solid rgba(13, 110, 253, 0.2)",
            margin: "0.25rem 0.5rem",
            borderRadius: "0.375rem",
            transition: "all 0.2s ease"
          }}
        >
          <i className="fas fa-eye me-1"></i>
          View All Notifications
        </button>
      </li>
    </ul>
  );
};

const TopBar = ({ onToggleSidebar }) => {
  const { user, logout, token, unreadNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Reset loading states when user changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarLoading(true);
      setAvatarError(false);
    }
  }, [user?.avatar]);

  const handleNavigation = (path) => {
    console.log("Navigating to:", path);
    navigate(path);
    document.body.click();
  };

  const handleLogout = async () => {
    const result = await showAlert.confirm(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      "Yes, Logout",
      "Cancel"
    );

    if (result.isConfirmed) {
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

      disableTopbarInteractions();

      setTimeout(async () => {
        try {
          await logout();
          showAlert.close();
          showToast.success("You have been logged out successfully");
        } catch (error) {
          showAlert.close();
          enableTopbarInteractions();
          showAlert.error(
            "Logout Error",
            "There was a problem logging out. Please try again."
          );
          console.error("Logout error:", error);
        }
      }, 1500);
    }
  };

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
      {/* Navbar Brand */}
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

      {/* REMOVED: Search Form */}

      {/* Navbar Items - Right aligned */}
      <ul className="navbar-nav ms-auto me-2 me-lg-3">

        {/* User Dropdown */}
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle d-flex align-items-center"
            id="navbarDropdown"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="position-relative me-2">
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
              </div>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button 
                className="dropdown-item custom-dropdown-item" 
                onClick={() => handleNavigation("/profile")}
              >
                <i className="fas fa-user me-2"></i>Profile
              </button>
            </li>
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

      {/* Fixed CSS styles */}
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

        .dropdown-menu .custom-dropdown-item {
          display: block;
          clear: both;
          font-weight: 400;
          text-decoration: none;
          white-space: nowrap;
          border: 0;
        }

        /* FIXED: Notification dropdown styles with better contrast */
        .custom-dropdown-header {
          background-color: var(--primary-color) !important;
          color: white !important;
          border-bottom: none;
          padding: 0.5rem 1rem;
        }

        .custom-notification-badge {
          background-color: rgba(255, 255, 255, 0.9) !important;
          color: var(--primary-color) !important;
          font-size: 0.75rem;
        }

        .custom-bell-icon {
          color: var(--primary-light);
          opacity: 0.7;
        }

        .custom-notification-item:hover {
          background-color: #f8f9fa;
        }

        /* FIXED: Light background View All button with primary color relation */
        .custom-view-all-btn:hover {
          background-color: rgba(13, 110, 253, 0.15) !important;
          color: var(--primary-color) !important;
          border-color: rgba(13, 110, 253, 0.3) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .custom-view-all-btn:focus {
          background-color: rgba(13, 110, 253, 0.15) !important;
          color: var(--primary-color) !important;
          border-color: rgba(13, 110, 253, 0.3) !important;
          outline: none;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </nav>
  );
};

export default TopBar;