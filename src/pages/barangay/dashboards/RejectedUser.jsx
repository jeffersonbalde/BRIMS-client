// components/dashboards/RejectedUser.jsx
import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert } from "../../../services/notificationService";
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
  FaFileAlt,
  FaUserCheck,
  FaListAlt,
} from "react-icons/fa";

const RejectedUser = () => {
  const { user } = useAuth();

  const handleContactSupport = () => {
    showAlert.info(
      "Contact Municipal Administrator",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="margin-bottom: 12px;">
          <strong>📞 Phone Support</strong><br>
          <span style="color: #666;">(+63) XXX-XXX-XXXX</span>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>📧 Email Support</strong><br>
          <span style="color: #666;">admin@municipality.gov.ph</span>
        </div>
        <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
          <strong>🕐 Office Hours</strong><br>
          <span style="color: #666;">Mon-Fri: 8:00 AM - 5:00 PM</span>
        </div>
      </div>
      `,
      "Got it"
    );
  };

  const handleGetHelp = () => {
    showAlert
      .info(
        "Need Assistance?",
        `
      <div style="text-align: center; line-height: 1.6;">
        <p style="color: #666; margin-bottom: 12px;">We're here to help resolve your account rejection.</p>
        <div style="background: #fffbf0; padding: 8px; border-radius: 6px; border-left: 3px solid #ffc107;">
          <strong>💡 Quick Tips:</strong><br>
          <span style="color: #666;">
            • Review rejection reason carefully<br>
            • Contact administrator for clarification<br>
            • Prepare required documents for reapplication
          </span>
        </div>
      </div>
      `,
        "Contact Support"
      )
      .then((result) => {
        if (result.isConfirmed) {
          handleContactSupport();
        }
      });
  };

  const handleStatusInquiry = () => {
    showAlert.info(
      "Account Status",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #fff5f5; padding: 10px; border-radius: 6px; border: 1px solid #f8d7da; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <div style="width: 10px; height: 10px; background: #dc3545; border-radius: 50%; margin-right: 8px;"></div>
            <strong>Status: Registration Rejected</strong>
          </div>
          <p style="color: #666; margin: 0; font-size: 0.85em;">
            Your barangay account registration was not approved.
          </p>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">📅 Rejected On</strong><br>
            <span style="color: #666; font-size: 0.75em;">${new Date().toLocaleDateString()}</span>
          </div>
          <div style="flex: 1; background: white; padding: 6px; border-radius: 4px; border: 1px solid #e9ecef;">
            <strong style="font-size: 0.8em;">⏱️ Resolution</strong><br>
            <span style="color: #666; font-size: 0.75em;">Contact support</span>
          </div>
        </div>
      </div>
      `,
      "Understand"
    );
  };

  const handleProcessStepClick = (step, title) => {
    showAlert.info(
      `Step ${step}: ${title}`,
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #f8f9fa; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
          <strong>Resolution Details</strong><br>
          <span style="color: #666;">
            Important step to resolve your account rejection.
          </span>
        </div>
        
        <div style="background: #ffeaea; padding: 6px; border-radius: 4px; border-left: 3px solid #dc3545;">
          <strong>Current Progress:</strong><br>
          <span style="color: #666;">
            Step ${step} of 4 - ${step === 1 ? "Action Required" : "Pending"}
          </span>
        </div>
      </div>
      `,
      "Got it"
    );
  };

  const handleFeatureClick = (featureText) => {
    showAlert.info(
      "Feature Preview",
      `
      <div style="text-align: center; line-height: 1.6;">
        <div style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <strong>${featureText}</strong>
        </div>
        
        <p style="color: #666; margin-bottom: 10px; font-size: 0.9em;">
          Available after account approval.
        </p>
        
        <div style="background: #ffeaea; padding: 6px; border-radius: 4px; border-left: 3px solid #dc3545;">
          <strong>Status:</strong><br>
          <span style="color: #666;">Account rejected - Contact support</span>
        </div>
      </div>
      `,
      "OK"
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

  return (
    <div className="container-fluid px-1 py-3">
      {/* Enhanced Header */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3 position-relative flex-shrink-0"
            style={{
              width: "50px",
              height: "50px",
              background: "#dc3545",
              boxShadow: "0 4px 15px rgba(220, 53, 69, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(220, 53, 69, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(220, 53, 69, 0.4)";
            }}
          >
            <FaTimesCircle size={22} className="text-white" />
          </div>
          <div className="text-start">
            <h1 className="h4 mb-1 fw-bold" style={{ color: "#dc3545" }}>
              Account Registration Rejected
            </h1>
            <p className="text-muted mb-0 small">
              Your barangay registration was not approved by the administration team
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Grid Layout */}
      <div className="row g-3">
        {/* Status Card - Enhanced */}
        <div className="col-12 col-lg-8">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "white",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#dc3545",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(220, 53, 69, 0.4)",
                  }}
                >
                  <FaExclamationTriangle size={14} />
                </div>
                <h6 className="mb-0 fw-bold" style={{ color: "#dc3545" }}>
                  Rejection Details
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      boxShadow: "0 3px 12px rgba(220, 53, 69, 0.25)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleStatusInquiry}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(220, 53, 69, 0.15)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.5)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 5px 18px rgba(220, 53, 69, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(220, 53, 69, 0.1)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 3px 12px rgba(220, 53, 69, 0.25)";
                    }}
                  >
                    <FaCalendarAlt
                      className="text-danger me-2 flex-shrink-0"
                      size={14}
                    />
                    <div>
                      <small
                        className="text-muted d-block fw-semibold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Rejected On
                      </small>
                      <span
                        className="fw-semibold small"
                        style={{ color: "#dc3545", fontSize: "0.8rem" }}
                      >
                        {formatDate(user?.rejected_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    className="d-flex align-items-center p-2 rounded-3 position-relative overflow-hidden"
                    style={{
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      boxShadow: "0 3px 12px rgba(220, 53, 69, 0.25)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={handleStatusInquiry}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(220, 53, 69, 0.15)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.5)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 5px 18px rgba(220, 53, 69, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(220, 53, 69, 0.1)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 3px 12px rgba(220, 53, 69, 0.25)";
                    }}
                  >
                    <FaTimesCircle
                      className="text-danger me-2 flex-shrink-0"
                      size={14}
                    />
                    <div>
                      <small
                        className="text-muted d-block fw-semibold"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Status
                      </small>
                      <span
                        className="badge small px-2 py-1 fw-semibold"
                        style={{
                          background: "#dc3545",
                          color: "white",
                          fontSize: "0.75rem",
                          boxShadow: "0 2px 8px rgba(220, 53, 69, 0.4)",
                        }}
                      >
                        Rejected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div
                    className="rounded-3 p-3 mt-2 position-relative overflow-hidden"
                    style={{
                      background: "rgba(220, 53, 69, 0.08)",
                      border: "1px solid rgba(220, 53, 69, 0.2)",
                      boxShadow: "0 3px 15px rgba(220, 53, 69, 0.2)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(220, 53, 69, 0.12)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.3)";
                      e.currentTarget.style.boxShadow =
                        "0 5px 20px rgba(220, 53, 69, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(220, 53, 69, 0.08)";
                      e.currentTarget.style.borderColor =
                        "rgba(220, 53, 69, 0.2)";
                      e.currentTarget.style.boxShadow =
                        "0 3px 15px rgba(220, 53, 69, 0.2)";
                    }}
                  >
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                          width: "20px",
                          height: "20px",
                          background: "#dc3545",
                          color: "white",
                          boxShadow: "0 2px 8px rgba(220, 53, 69, 0.4)",
                        }}
                      >
                        <FaInfoCircle size={10} />
                      </div>
                      <small
                        className="fw-semibold"
                        style={{ color: "#dc3545", fontSize: "0.85rem" }}
                      >
                        Rejection Reason
                      </small>
                    </div>
                    <p
                      className="mb-0 small text-muted"
                      style={{ lineHeight: "1.4", fontSize: "0.8rem" }}
                    >
                      {user?.rejection_reason ||
                        "No specific reason was provided for the rejection of your account registration. Please contact the municipal administrator for clarification and guidance on next steps."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card - Enhanced */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "white",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <h6 className="mb-0 fw-bold" style={{ color: "#dc3545" }}>
                Quick Actions
              </h6>
            </div>
            <div className="card-body p-3 d-flex flex-column">
              <button
                className="btn w-100 d-flex align-items-center justify-content-center py-2 mb-2 position-relative overflow-hidden"
                onClick={handleContactSupport}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(220, 53, 69, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(220, 53, 69, 0.6)";
                  e.target.style.background = "#c82333";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(220, 53, 69, 0.4)";
                  e.target.style.background = "#dc3545";
                }}
              >
                <FaEnvelope className="me-2" size={12} />
                Contact Administrator
                <FaArrowRight className="ms-2" size={10} />
              </button>

              <div className="text-center mt-2">
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  <FaCalendarAlt className="me-1" size={10} />
                  Mon-Fri, 8AM-5PM
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Details Card - Enhanced */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "white",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "#4a8c47",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(74, 140, 71, 0.4)",
                  }}
                >
                  <FaUser size={12} />
                </div>
                <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
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
                    icon: FaPhone,
                    label: "Contact",
                    value: user?.contact,
                    color: "#6fbf67",
                  },
                ].map((item, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-center p-2 rounded-3 mb-2 border position-relative overflow-hidden"
                      style={{
                        background: "white",
                        borderColor: `${item.color}40 !important`,
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleFeatureClick(item.value || "N/A")}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = `${item.color}80 !important`;
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 5px 18px rgba(0, 0, 0, 0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = `${item.color}40 !important`;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 3px 12px rgba(0, 0, 0, 0.15)";
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
                          style={{ color: "#2d5a27" }}
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

        {/* Resolution Steps Card - Enhanced */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "10px",
              background: "white",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 12px 35px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "#dc3545",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(220, 53, 69, 0.4)",
                  }}
                >
                  <FaListAlt size={12} />
                </div>
                <h6 className="mb-0 fw-semibold" style={{ color: "#2d5a27" }}>
                  Resolution Steps
                </h6>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                {[
                  {
                    step: "1",
                    title: "Review Rejection Reason",
                    description:
                      "Understand why your application was rejected and what needs to be addressed",
                    color: "#dc3545",
                    icon: FaFileAlt,
                  },
                  {
                    step: "2",
                    title: "Contact Administrator",
                    description:
                      "Get clarification and guidance on the rejection reason and required corrections",
                    color: "#4a8c47",
                    icon: FaShieldAlt,
                  },
                  {
                    step: "3",
                    title: "Gather Required Documents",
                    description:
                      "Prepare necessary documents and information for reapplication",
                    color: "#2196f3",
                    icon: FaUserCheck,
                  },
                  {
                    step: "4",
                    title: "Follow Up",
                    description:
                      "Complete necessary steps and follow up with the municipal office",
                    color: "#5da55a",
                    icon: FaInfoCircle,
                  },
                ].map((item, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div
                      className="d-flex align-items-start p-2 rounded-3 mb-2 border position-relative overflow-hidden"
                      style={{
                        background: "white",
                        borderColor: `${item.color}40 !important`,
                        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleProcessStepClick(item.step, item.title)
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8f9fa";
                        e.currentTarget.style.borderColor = `${item.color}80 !important`;
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 5px 18px rgba(0, 0, 0, 0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = `${item.color}40 !important`;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 3px 12px rgba(0, 0, 0, 0.15)";
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0 mt-1"
                        style={{
                          width: "20px",
                          height: "20px",
                          background: item.color,
                          color: "white",
                          fontSize: "0.6rem",
                          fontWeight: "600",
                          boxShadow: `0 3px 10px ${item.color}50`,
                        }}
                      >
                        <item.icon size={8} />
                      </div>
                      <div>
                        <small
                          className="fw-semibold d-block"
                          style={{ color: "#2d5a27", fontSize: "0.8rem" }}
                        >
                          {item.title}
                        </small>
                        <small
                          className="text-muted"
                          style={{ fontSize: "0.75rem", lineHeight: "1.3" }}
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

        {/* Enhanced Information Banner */}
        <div className="col-12">
          <div
            className="card border-0"
            style={{
              background: "rgba(220, 53, 69, 0.03)",
              border: "1px solid rgba(220, 53, 69, 0.1)",
              boxShadow: "0 6px 20px rgba(220, 53, 69, 0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220, 53, 69, 0.05)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(220, 53, 69, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(220, 53, 69, 0.03)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(220, 53, 69, 0.2)";
            }}
          >
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col">
                  <p
                    className="mb-0 small text-muted"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <strong>Note:</strong> Your account has limited access due to rejection. 
                    Contact the municipal administrator to resolve this issue and reapply 
                    for barangay account access.
                  </p>
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