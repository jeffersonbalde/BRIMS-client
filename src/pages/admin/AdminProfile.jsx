// src/pages/admin/AdminProfile.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../../services/notificationService";
import {
  FaShieldAlt,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaKey,
  FaCog,
  FaUserShield
} from "react-icons/fa";

const AdminProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleSettingsNavigation = () => {
    showAlert.confirm(
      "Administrator Settings",
      "You can change your password and manage security settings in the Settings page.",
      "Go to Settings",
      "Cancel"
    ).then((result) => {
      if (result.isConfirmed) {
        navigate("/settings");
      }
    });
  };

  const handlePasswordChange = () => {
    showAlert.confirm(
      "Change Password",
      "Please go to Settings to update your administrator password securely.",
      "Go to Settings",
      "Cancel"
    ).then((result) => {
      if (result.isConfirmed) {
        navigate("/settings");
      }
    });
  };

  return (
    <div className="container-fluid px-1 py-4 fadeIn">
      {/* Header Section */}
      <div className="text-center mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-3 flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
              boxShadow: "0 4px 15px rgba(45, 89, 48, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(51, 107, 49, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(51, 107, 49, 0.4)";
            }}
          >
            <FaShieldAlt size={22} className="text-white" />
          </div>
          <div className="text-center text-md-start">
            <h1 className="h3 mb-1 fw-bold" style={{ color: "var(--text-primary)" }}>
              System Administrator
            </h1>
            <p className="text-muted mb-0">
              {user?.name} • Full System Access
            </p>
            <small className="text-muted">
              Municipal Administrator Account
            </small>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Administrator Information */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "12px",
              background: "var(--background-white)",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3 px-md-4"
              style={{
                background: "var(--background-light)",
                borderBottom: "2px solid var(--border-color)",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--primary-color)",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(51, 107, 49, 0.4)",
                  }}
                >
                  <FaUser style={{ fontSize: "1rem" }} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                    Administrator Information
                  </h6>
                  <small className="text-muted">System administrator account details</small>
                </div>
              </div>
            </div>
            <div className="card-body p-3 p-md-4">
              <div className="row g-3">
                {[
                  { 
                    icon: FaUser, 
                    label: "Full Name", 
                    value: user?.name,
                    description: "Administrator's full name"
                  },
                  { 
                    icon: FaEnvelope, 
                    label: "Email Address", 
                    value: user?.email,
                    description: "Primary contact email"
                  },
                  { 
                    icon: FaShieldAlt, 
                    label: "Account Role", 
                    value: "System Administrator",
                    description: "Highest privilege level"
                  },
                  { 
                    icon: FaCalendarAlt, 
                    label: "Account Created", 
                    value: formatDate(user?.created_at),
                    description: "Date account was created"
                  },
                ].map((item, index) => (
                  <div key={index} className="col-12">
                    <div 
                      className="d-flex align-items-start p-3 rounded-3 position-relative overflow-hidden"
                      style={{
                        background: "var(--background-white)",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--background-light)";
                        e.currentTarget.style.borderColor = "var(--primary-color)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(51, 107, 49, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--background-white)";
                        e.currentTarget.style.borderColor = "var(--border-color)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                          }}
                        >
                          <item.icon style={{ fontSize: "1rem", color: "var(--primary-color)" }} />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <small className="d-block text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                              {item.label}
                            </small>
                            <span className="fw-semibold d-block" style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                              {item.value}
                            </span>
                          </div>
                        </div>
                        <small className="text-muted mt-1 d-block" style={{ fontSize: "0.7rem" }}>
                          {item.description}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Access & Security */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "12px",
              background: "var(--background-white)",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3 px-md-4"
              style={{
                background: "var(--background-light)",
                borderBottom: "2px solid var(--border-color)",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--accent-color)",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(199, 74, 104, 0.4)",
                  }}
                >
                  <FaShieldAlt style={{ fontSize: "1rem" }} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                    System Access & Security
                  </h6>
                  <small className="text-muted">Administrative privileges and security</small>
                </div>
              </div>
            </div>
            <div className="card-body p-3 p-md-4">
              {/* Privileges Info */}
              <div 
                className="rounded-3 p-3 mb-4"
                style={{
                  background: "rgba(51, 107, 49, 0.05)",
                  border: "1px solid rgba(51, 107, 49, 0.2)",
                  boxShadow: "0 2px 8px rgba(51, 107, 49, 0.1)",
                }}
              >
                <strong style={{ color: "var(--text-primary)" }} className="d-block mb-2">
                  Administrator Privileges:
                </strong>
                <ul className="mb-0 small" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  <li>Full system configuration and management</li>
                  <li>User account approvals and rejections</li>
                  <li>Barangay account management</li>
                  <li>System audit logs and reporting</li>
                  <li>Database maintenance and backups</li>
                  <li>Security settings and access controls</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="row g-2">
                <div className="col-12">
                  <button
                    className="btn w-100 d-flex align-items-center justify-content-center py-2 position-relative overflow-hidden"
                    onClick={handlePasswordChange}
                    style={{
                      background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
                      color: "var(--btn-primary-text)",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      boxShadow: "0 3px 12px rgba(51, 107, 49, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)";
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 5px 18px rgba(51, 107, 49, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 3px 12px rgba(51, 107, 49, 0.4)";
                    }}
                  >
                    <FaKey className="me-2 flex-shrink-0" style={{ fontSize: "0.9rem" }} />
                    <span>Change Administrator Password</span>
                  </button>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-4 p-3 rounded-3" style={{
                background: "rgba(199, 74, 104, 0.05)",
                border: "1px solid rgba(199, 74, 104, 0.2)",
              }}>
                <small className="text-muted d-block text-center" style={{ fontSize: "0.8rem" }}>
                  <FaShieldAlt className="me-1 flex-shrink-0" style={{ fontSize: "0.8rem" }} />
                  For security reasons, administrator accounts have restricted profile modifications.
                  Contact system support for major account changes.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;