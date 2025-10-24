// pages/Profile.jsx - UPDATED with Proper Contact Support Modal
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { showAlert } from "../services/notificationService"; // ADDED IMPORT
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaShieldAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaInfoCircle,
  FaArrowRight,
} from "react-icons/fa";

const Profile = () => {
  const { user } = useAuth();

  // UPDATED: Use the same modal as Settings.jsx
  const handleContactSupport = () => {
    const phoneNumber = "+639123456789";
    const email = "admin@municipality.gov.ph";
    
    showAlert.info(
      "Contact Support",
      `<div style="text-align: left;">
        <p><strong>Municipal Administrator Contact Details:</strong></p>
        <p>📞 Phone: <strong>${phoneNumber}</strong></p>
        <p>📧 Email: <strong>${email}</strong></p>
        <p><br>Office Hours: <strong>8:00 AM - 5:00 PM (Monday-Friday)</strong></p>
      </div>`,
      "Got it"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: FaCheckCircle,
          gradient: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
          color: "#4CAF50",
        };
      case "pending":
        return {
          icon: FaClock,
          gradient: "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)",
          color: "#ff9800",
        };
      case "rejected":
        return {
          icon: FaTimesCircle,
          gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          color: "#ff6b6b",
        };
      default:
        return {
          icon: FaInfoCircle,
          gradient: "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)",
          color: "#6c757d",
        };
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "approved":
        return "Account Approved";
      case "pending":
        return "Pending Review";
      case "rejected":
        return "Account Rejected";
      default:
        return "Unknown Status";
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case "admin":
        return "Municipal Administrator";
      case "barangay":
        return "Barangay Official";
      default:
        return role;
    }
  };

  const statusConfig = getStatusIcon(user?.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container-fluid px-1 py-3">
      {/* Header with Light Background - Matching PendingApproval */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 position-relative flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: statusConfig.gradient,
              boxShadow: `0 4px 15px ${statusConfig.color}30`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = `0 6px 20px ${statusConfig.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 4px 15px ${statusConfig.color}30`;
            }}
          >
            <StatusIcon size={22} className="text-white" />
          </div>
          <div className="text-start">
            <h1
              className="h3 mb-1 fw-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {getStatusDisplay(user?.status)}
            </h1>
            <p className="text-muted mb-0 small">
              {user?.name} • {getRoleDisplay(user?.role)}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Grid Layout with Enhanced Colors */}
      <div className="row g-3">
        {/* Profile Overview Card - Enhanced */}
        <div className="col-12 col-lg-8">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              background:
                "linear-gradient(135deg, var(--background-white) 0%, #f8fdf8 100%)",
              borderRadius: "12px",
              border: "1px solid rgba(45, 90, 39, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(45, 90, 39, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)",
                borderBottom: "2px solid rgba(45, 90, 39, 0.3)",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    background:
                      "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                    color: "white",
                  }}
                >
                  <FaUser size={14} />
                </div>
                <h6
                  className="mb-0 fw-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Profile Overview
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
{/* Enhanced Avatar and Basic Info */}
<div className="col-12">
  <div className="d-flex align-items-center mb-3">
    <div className="position-relative me-3">
      <div
        className="rounded-circle border d-flex align-items-center justify-content-center position-relative"
        style={{
          width: "80px",
          height: "80px",
          // Check if avatar exists AND is a valid non-empty string
          background: user?.avatar && user.avatar.trim() !== '' && user.avatar !== 'null' && user.avatar !== 'undefined'
            ? "transparent"
            : user?.role === 'admin' 
              ? "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)" // Brown gradient for admin
              : "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)", // Green gradient for barangay
          border: user?.role === 'admin' 
            ? "3px solid #8B4513 !important" 
            : "3px solid var(--primary-light) !important",
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* Only show image if avatar exists and is valid */}
        {user?.avatar && user.avatar.trim() !== '' && user.avatar !== 'null' && user.avatar !== 'undefined' ? (
          <img
            src={user.avatar}
            alt="Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
            onError={(e) => {
              // Hide broken image and show the gradient background with icon
              e.target.style.display = "none";
              // Show the icon when image fails to load
              const icon = e.target.nextSibling;
              if (icon) {
                icon.style.display = "flex";
              }
            }}
          />
        ) : null}
        
        {/* Always render the icon - shown when no avatar or avatar fails to load */}
        <div 
          className="d-flex align-items-center justify-content-center"
          style={{
            display: (user?.avatar && user.avatar.trim() !== '' && user.avatar !== 'null' && user.avatar !== 'undefined') 
              ? "none" 
              : "flex",
            width: "100%",
            height: "100%",
          }}
        >
          {user?.role === 'admin' ? (
            <FaShieldAlt size={32} /> // Shield icon for admin
          ) : (
            <FaUser size={32} /> // User icon for barangay
          )}
        </div>
      </div>

      <div className="position-absolute bottom-0 end-0">
        {user?.is_active ? (
          <span
            className="badge p-1"
            style={{
              background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
              color: "white",
              fontSize: "0.6rem",
            }}
          >
            Active
          </span>
        ) : (
          <span
            className="badge p-1"
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
              color: "white",
              fontSize: "0.6rem",
            }}
          >
            Inactive
          </span>
        )}
      </div>
    </div>
    <div>
      <h5
        className="mb-1 fw-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {user?.name}
      </h5>
      <p className="text-muted mb-1 small">{user?.position}</p>
      <p className="text-muted mb-0 small">
        {getRoleDisplay(user?.role)}
      </p>
    </div>
  </div>
</div>

                {/* Enhanced Timeline Information */}
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-2 position-relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)",
                      border: "1px solid rgba(45, 90, 39, 0.3)",
                      boxShadow: "0 2px 6px rgba(45, 90, 39, 0.15)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(45, 90, 39, 0.4)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(45, 90, 39, 0.25)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(45, 90, 39, 0.3)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(45, 90, 39, 0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FaCalendarAlt
                      className="text-primary me-2 flex-shrink-0"
                      size={14}
                    />
                    <div>
                      <small className="text-muted d-block fw-semibold">
                        Registered
                      </small>
                      <span
                        className="fw-semibold small"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatDate(user?.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Badge */}
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-2 position-relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${statusConfig.color}20 0%, ${statusConfig.color}15 100%)`,
                      border: `1px solid ${statusConfig.color}30`,
                      boxShadow: `0 2px 6px ${statusConfig.color}15`,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${statusConfig.color}25 0%, ${statusConfig.color}20 100%)`;
                      e.currentTarget.style.borderColor = `${statusConfig.color}40`;
                      e.currentTarget.style.boxShadow = `0 4px 12px ${statusConfig.color}25`;
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${statusConfig.color}20 0%, ${statusConfig.color}15 100%)`;
                      e.currentTarget.style.borderColor = `${statusConfig.color}30`;
                      e.currentTarget.style.boxShadow = `0 2px 6px ${statusConfig.color}15`;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <StatusIcon
                      className="me-2 flex-shrink-0"
                      size={14}
                      style={{ color: statusConfig.color }}
                    />
                    <div>
                      <small className="text-muted d-block fw-semibold">
                        Account Status
                      </small>
                      <span
                        className="badge small px-2 py-1 fw-semibold"
                        style={{
                          background: statusConfig.gradient,
                          color: "white",
                          boxShadow: `0 2px 8px ${statusConfig.color}30`,
                        }}
                      >
                        {getStatusDisplay(user?.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Details */}
                {user?.approved_at && (
                  <div className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-2 position-relative overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(69, 160, 73, 0.1) 100%)",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                        boxShadow: "0 2px 6px rgba(76, 175, 80, 0.15)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaCheckCircle
                        className="text-success me-2 flex-shrink-0"
                        size={14}
                      />
                      <div>
                        <small className="text-muted d-block fw-semibold">
                          Approved On
                        </small>
                        <span
                          className="fw-semibold small"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {formatDate(user?.approved_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {user?.rejected_at && (
                  <div className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-2 position-relative overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 82, 0.1) 100%)",
                        border: "1px solid rgba(255, 107, 107, 0.3)",
                        boxShadow: "0 2px 6px rgba(255, 107, 107, 0.15)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaTimesCircle
                        className="text-danger me-2 flex-shrink-0"
                        size={14}
                      />
                      <div>
                        <small className="text-muted d-block fw-semibold">
                          Rejected On
                        </small>
                        <span
                          className="fw-semibold small"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {formatDate(user?.rejected_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card - Enhanced with Consistent Background */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              background:
                "linear-gradient(135deg, var(--background-white) 0%, #f8fdf8 100%)",
              borderRadius: "12px",
              border: "1px solid rgba(45, 90, 39, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(45, 90, 39, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)",
                borderBottom: "2px solid rgba(45, 90, 39, 0.2)",
              }}
            >
              <h6
                className="mb-0 fw-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Quick Actions
              </h6>
            </div>
            <div className="card-body p-3 d-flex flex-column">
              {/* UPDATED: Contact Support Button - Now uses the same modal as Settings.jsx */}
              <button
                className="btn w-100 d-flex align-items-center justify-content-center py-2 mb-2 position-relative overflow-hidden"
                onClick={handleContactSupport}
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(45, 90, 39, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 15px rgba(45, 90, 39, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(45, 90, 39, 0.2)";
                }}
              >
                <FaEnvelope className="me-2" size={12} />
                Contact Support
                <FaArrowRight className="ms-2" size={10} />
              </button>

              <div className="text-center mt-auto">
                <small className="text-muted">📞 Mon-Fri, 8AM-5PM</small>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card - Enhanced */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              background:
                "linear-gradient(135deg, var(--background-white) 0%, #fafefa 100%)",
              borderRadius: "12px",
              border: "1px solid rgba(45, 90, 39, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(45, 90, 39, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)",
                borderBottom: "2px solid rgba(74, 140, 71, 0.2)",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "28px",
                    height: "28px",
                    background:
                      "linear-gradient(135deg, var(--accent-color) 0%, var(--accent-light) 100%)",
                    color: "white",
                  }}
                >
                  <FaUser size={12} />
                </div>
                <h6
                  className="mb-0 fw-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Personal Information
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  {
                    icon: FaUser,
                    label: "Full Name",
                    value: user?.name,
                    color: "#4a8c47",
                  },
                  {
                    icon: FaIdCard,
                    label: "Position",
                    value: user?.position,
                    color: "#5da55a",
                  },
                  {
                    icon: FaEnvelope,
                    label: "Email Address",
                    value: user?.email,
                    color: "#6fbf67",
                  },
                  {
                    icon: FaPhone,
                    label: "Contact Number",
                    value: user?.contact || "Not provided",
                    color: "#4a8c47",
                  },
                  {
                    icon: FaShieldAlt,
                    label: "Account Role",
                    value: getRoleDisplay(user?.role),
                    color: "#5da55a",
                  },
                  {
                    icon: FaCalendarAlt,
                    label: "Member Since",
                    value: formatDate(user?.created_at),
                    color: "#6fbf67",
                  },
                ].map((item, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-2 mb-2 border"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)",
                        borderColor: "rgba(45, 90, 39, 0.2) !important",
                        boxShadow: "0 2px 6px rgba(45, 90, 39, 0.18)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 248, 1) 100%)";
                        e.currentTarget.style.borderColor = `${item.color}60 !important`;
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(45, 90, 39, 0.15)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)";
                        e.currentTarget.style.borderColor =
                          "rgba(45, 90, 39, 0.2) !important";
                        e.currentTarget.style.boxShadow =
                          "0 2px 6px rgba(45, 90, 39, 0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <item.icon
                        className="me-2 flex-shrink-0"
                        size={10}
                        style={{ color: item.color }}
                      />
                      <div className="flex-grow-1">
                        <small
                          className="text-muted d-block"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {item.label}
                        </small>
                        <span
                          className="fw-semibold small"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Information Card - Enhanced */}
        {(user?.barangay_name || user?.municipality) && (
          <div className="col-12 col-lg-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background:
                  "linear-gradient(135deg, var(--background-white) 0%, #f8fcf8 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 167, 38, 0.2)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(45, 90, 39, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div
                className="card-header bg-transparent border-0 py-3 px-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 167, 38, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%)",
                  borderBottom: "2px solid rgba(255, 167, 38, 0.2)",
                }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: "28px",
                      height: "28px",
                      background:
                        "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)",
                      color: "white",
                    }}
                  >
                    <FaMapMarkerAlt size={12} />
                  </div>
                  <h6
                    className="mb-0 fw-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Location Information
                  </h6>
                </div>
              </div>
              <div className="card-body p-3">
                <div className="row g-2">
                  {[
                    {
                      icon: FaBuilding,
                      label: "Barangay",
                      value: user?.barangay_name,
                      color: "#ffa726",
                    },
                    {
                      icon: FaMapMarkerAlt,
                      label: "Municipality",
                      value: user?.municipality,
                      color: "#4a8c47",
                    },
                  ].map((item, index) => (
                    <div key={index} className="col-12">
                      <div
                        className="d-flex align-items-start p-2 rounded-2 mb-2 border"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)",
                          borderColor: "rgba(45, 90, 39, 0.2) !important",
                          boxShadow: "0 2px 6px rgba(45, 90, 39, 0.12)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 248, 1) 100%)";
                          e.currentTarget.style.borderColor = `${item.color}60 !important`;
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(45, 90, 39, 0.15)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)";
                          e.currentTarget.style.borderColor =
                            "rgba(45, 90, 39, 0.2) !important";
                          e.currentTarget.style.boxShadow =
                            "0 2px 6px rgba(45, 90, 39, 0.08)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <item.icon
                          className="me-2 flex-shrink-0 mt-1"
                          size={10}
                          style={{ color: item.color }}
                        />
                        <div>
                          <small
                            className="fw-semibold d-block"
                            style={{
                              color: "var(--text-primary)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.label}
                          </small>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem", lineHeight: "1.3" }}
                          >
                            {item.value}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Card (Only for rejected users) */}
        {user?.status === "rejected" && user?.rejection_reason && (
          <div className="col-12">
            <div
              className="card border-0 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(238, 90, 82, 0.08) 100%)",
                border: "1px solid rgba(255, 107, 107, 0.2)",
                boxShadow: "0 2px 6px rgba(255, 107, 107, 0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(255, 107, 107, 0.12) 0%, rgba(238, 90, 82, 0.12) 100%)";
                e.currentTarget.style.borderColor = "rgba(255, 107, 107, 0.3)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(255, 107, 107, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(238, 90, 82, 0.08) 100%)";
                e.currentTarget.style.borderColor = "rgba(255, 107, 107, 0.2)";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(255, 107, 107, 0.1)";
              }}
            >
              <div className="card-body p-2">
                <div className="row align-items-center">
                  <div className="col">
                    <p className="mb-0 small text-muted">
                      <strong>Rejection Reason:</strong> {user.rejection_reason}
                    </p>
                  </div>
                  <div className="col-auto">
                    {/* UPDATED: Appeal Decision Button - Now uses the same modal as Settings.jsx */}
                    <button
                      className="btn btn-sm position-relative overflow-hidden"
                      onClick={handleContactSupport}
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                        color: "var(--background-white)",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.6rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(45, 90, 39, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(45, 90, 39, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 2px 6px rgba(45, 90, 39, 0.2)";
                      }}
                    >
                      Appeal Decision
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;