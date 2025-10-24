// components/dashboards/RejectedUser.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaTimesCircle,
  FaEnvelope,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaExclamationTriangle,
  FaInfoCircle,
  FaShieldAlt,
  FaArrowRight,
  FaPhone,
} from "react-icons/fa";

const RejectedUser = () => {
  const { user } = useAuth();

  const handleContactSupport = () => {
    const phoneNumber = "+639123456789";
    const email = "admin@municipality.gov.ph";
    const message = `Contact Municipal Administrator:\n\n📞 Phone: ${phoneNumber}\n📧 Email: ${email}\n\nOffice Hours: 8:00 AM - 5:00 PM (Monday-Friday)`;
    alert(message);
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

  return (
    <div className="container-fluid px-1 py-3">
      {/* Header with Light Background */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 position-relative flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
              boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(255, 107, 107, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(255, 107, 107, 0.3)";
            }}
          >
            <FaTimesCircle size={22} className="text-white" />
          </div>
          <div className="text-start">
            <h1
              className="h3 mb-1 fw-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Account Registration Rejected
            </h1>
            <p className="text-muted mb-0 small">
              Your barangay registration was not approved
            </p>
          </div>
        </div>
      </div>

      {/* Compact Grid Layout with Enhanced Colors */}
      <div className="row g-3">
        {/* Rejection Details Card - Enhanced */}
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
                      "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                    color: "white",
                  }}
                >
                  <FaExclamationTriangle size={14} />
                </div>
                <h6
                  className="mb-0 fw-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Rejection Details
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {/* Enhanced Rejection Date */}
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(238, 90, 82, 0.15) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 107, 107, 0.4)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(255, 107, 107, 0.25)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 82, 0.1) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 107, 107, 0.3)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(255, 107, 107, 0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FaCalendarAlt
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

                {/* Enhanced Status Badge */}
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-2 position-relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.1) 100%)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      boxShadow: "0 2px 6px rgba(220, 53, 69, 0.15)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(200, 35, 51, 0.15) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.4)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(220, 53, 69, 0.25)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(200, 35, 51, 0.1) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.3)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(220, 53, 69, 0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <FaTimesCircle
                      className="text-danger me-2 flex-shrink-0"
                      size={14}
                    />
                    <div>
                      <small className="text-muted d-block fw-semibold">
                        Status
                      </small>
                      <span
                        className="badge small px-2 py-1 fw-semibold"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)",
                        }}
                      >
                        Rejected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Rejection Reason */}
                <div className="col-12">
                  <div
                    className="rounded-2 p-2 mt-2 position-relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(45, 90, 39, 0.08) 0%, rgba(51, 108, 53, 0.08) 100%)",
                      border: "1px solid rgba(45, 90, 39, 0.25)",
                      boxShadow: "0 2px 6px rgba(45, 90, 39, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(45, 90, 39, 0.12) 0%, rgba(51, 108, 53, 0.12) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(45, 90, 39, 0.35)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(45, 90, 39, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgba(45, 90, 39, 0.08) 0%, rgba(51, 108, 53, 0.08) 100%)";
                      e.currentTarget.style.borderColor =
                        "rgba(45, 90, 39, 0.25)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(45, 90, 39, 0.1)";
                    }}
                  >
                    <div className="d-flex align-items-center mb-1">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "20px",
                          height: "20px",
                          background:
                            "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                          color: "white",
                        }}
                      >
                        <FaInfoCircle size={10} />
                      </div>
                      <small
                        className="fw-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Rejection Reason
                      </small>
                    </div>
                    <p
                      className="mb-0 small text-muted"
                      style={{ lineHeight: "1.4" }}
                    >
                      {user?.rejection_reason ||
                        "No specific reason was provided for the rejection of your account registration."}
                    </p>
                  </div>
                </div>
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

        {/* Registration Details Card - Enhanced */}
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
                  Registration Details
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
                    icon: FaBuilding,
                    label: "Barangay",
                    value: user?.barangay_name,
                    color: "#6fbf67",
                  },
                  {
                    icon: FaMapMarkerAlt,
                    label: "Municipality",
                    value: user?.municipality,
                    color: "#4a8c47",
                  },
                  {
                    icon: FaEnvelope,
                    label: "Email",
                    value: user?.email,
                    color: "#5da55a",
                  },
                  {
                    icon: FaShieldAlt,
                    label: "Contact",
                    value: user?.contact,
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
                          {item.value || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps Card - Enhanced */}
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
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
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
                  <FaInfoCircle size={12} />
                </div>
                <h6
                  className="mb-0 fw-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Next Steps
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  {
                    step: "1",
                    title: "Review Reason",
                    description: "Understand why your application was rejected",
                    color: "#ff6b6b",
                  },
                  {
                    step: "2",
                    title: "Contact Admin",
                    description: "Get clarification and guidance",
                    color: "#4a8c47",
                  },
                  {
                    step: "3",
                    title: "Gather Documents",
                    description: "Prepare required information",
                    color: "#5da55a",
                  },
                  {
                    step: "4",
                    title: "Follow Up",
                    description: "Complete necessary steps",
                    color: "#6fbf67",
                  },
                ].map((item, index) => (
                  <div key={index} className="col-12 col-sm-6">
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
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0 mt-1"
                        style={{
                          width: "18px",
                          height: "18px",
                          background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                          color: "white",
                          fontSize: "0.6rem",
                          fontWeight: "600",
                          boxShadow: `0 2px 8px ${item.color}40`,
                        }}
                      >
                        {item.step}
                      </div>
                      <div>
                        <small
                          className="fw-semibold d-block"
                          style={{
                            color: "var(--text-primary)",
                            fontSize: "0.75rem",
                          }}
                        >
                          {item.title}
                        </small>
                        <small
                          className="text-muted"
                          style={{ fontSize: "0.7rem", lineHeight: "1.3" }}
                        >
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

        {/* Information Banner - Enhanced */}
        <div className="col-12">
          <div
            className="card border-0 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(45, 90, 39, 0.08) 0%, rgba(51, 108, 53, 0.08) 100%)",
              border: "1px solid rgba(45, 90, 39, 0.2)",
              boxShadow: "0 2px 6px rgba(45, 90, 39, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(45, 90, 39, 0.12) 0%, rgba(51, 108, 53, 0.12) 100%)";
              e.currentTarget.style.borderColor = "rgba(45, 90, 39, 0.3)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(45, 90, 39, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(45, 90, 39, 0.08) 0%, rgba(51, 108, 53, 0.08) 100%)";
              e.currentTarget.style.borderColor = "rgba(45, 90, 39, 0.2)";
              e.currentTarget.style.boxShadow =
                "0 2px 6px rgba(45, 90, 39, 0.1)";
            }}
          >
            <div className="card-body p-2">
              <div className="row align-items-center">
                <div className="col">
                  <p className="mb-0 small text-muted">
                    <strong>Note:</strong> Your account has limited access.
                    Contact the municipal administrator to resolve this issue.
                  </p>
                </div>
                <div className="col-auto">
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
                    Get Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectedUser;
