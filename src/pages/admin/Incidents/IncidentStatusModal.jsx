// components/admin/IncidentStatusModal.jsx
import React, { useState, useEffect } from "react";
import { showAlert, showToast } from "../../../services/notificationService";
import Portal from "../../../components/Portal";

const IncidentStatusModal = ({
  incident,
  onClose,
  onStatusUpdate,
  loading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(incident.status);
  const [adminNotes, setAdminNotes] = useState(incident.admin_notes || "");

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === "Escape" && !loading) {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    };
  }, [loading]);

  const handleSubmit = async () => {
    if (
      selectedStatus === incident.status &&
      adminNotes === incident.admin_notes
    ) {
      showToast.info("No changes made");
      return;
    }

    if (selectedStatus !== incident.status && !adminNotes.trim()) {
      showToast.error("Please provide notes explaining the status change");
      return;
    }

    // Show confirmation dialog before updating
    const confirmation = await showAlert.confirm(
      'Confirm Status Update',
      `Are you sure you want to update the incident status?\n\nIncident Details:\n• Title: ${incident.title}\n• Current Status: ${incident.status}\n• New Status: ${selectedStatus}\n\nNotes: ${adminNotes || 'No additional notes provided'}\n\nThis action will notify the barangay reporter.`,
      'Yes, Update Status',
      'Cancel'
    );

    if (!confirmation.isConfirmed) {
      return; // User cancelled the confirmation
    }

    // Show processing SweetAlert
    showAlert.processing(
      'Updating Incident Status',
      'Please wait while we update the incident status...'
    );

    // Call the status update function
    onStatusUpdate(incident.id, selectedStatus, adminNotes);
  };

  const getSeverityBadge = (severity) => {
    const severityStyles = {
      Low: "bg-success text-white",
      Medium: "bg-warning text-dark",
      High: "bg-danger text-white",
      Critical: "bg-dark text-white",
    };
    return severityStyles[severity] || "bg-secondary text-white";
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Reported: "bg-primary text-white",
      Investigating: "bg-info text-white",
      Resolved: "bg-success text-white",
    };
    return statusStyles[status] || "bg-secondary text-white";
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      Flood: "fa-water",
      Landslide: "fa-mountain",
      Fire: "fa-fire",
      Earthquake: "fa-house-damage",
      Vehicular: "fa-car-crash",
    };
    return typeIcons[type] || "fa-exclamation-triangle";
  };

  return (
    <Portal>
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg mx-3 mx-sm-auto">
          <div
            className="modal-content border-0"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div
              className="modal-header border-0 text-white"
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #e0a800 100%)",
              }}
            >
              <h5 className="modal-title fw-bold">
                <i className="fas fa-edit me-2"></i>
                Update Incident Status
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                disabled={loading}
                aria-label="Close"
              ></button>
            </div>

            <div
              className="modal-body bg-light"
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              <div className="row g-3">
                {/* Incident Summary */}
                <div className="col-12">
                  <div className="card border-0 bg-white">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "50px",
                              height: "50px",
                              background:
                                "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                            }}
                          >
                            <i
                              className={`fas ${getTypeIcon(
                                incident.incident_type
                              )} text-white`}
                            ></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold text-dark">
                            {incident.title}
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            <span
                              className={`badge ${getSeverityBadge(
                                incident.severity
                              )}`}
                            >
                              {incident.severity}
                            </span>
                            <span
                              className={`badge ${getStatusBadge(
                                incident.status
                              )}`}
                            >
                              Current: {incident.status}
                            </span>
                            <span className="badge bg-light text-dark border">
                              <i
                                className={`fas ${getTypeIcon(
                                  incident.incident_type
                                )} me-1`}
                              ></i>
                              {incident.incident_type}
                            </span>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {incident.location} •{" "}
                            {incident.reporter?.barangay_name}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white">
                    <div
                      className="card-header border-bottom bg-white"
                      style={{
                        borderColor: "rgba(255, 193, 7, 0.2)",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-flag me-2 text-warning"></i>
                        New Status
                      </h6>
                    </div>
                    <div className="card-body" style={{ padding: "1rem" }}>
                      <select
                        className="form-select bg-white"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        disabled={loading}
                      >
                        <option value="Reported">Reported</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <small className="text-muted mt-2 d-block">
                        Select the new status for this incident
                      </small>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white">
                    <div
                      className="card-header border-bottom bg-white"
                      style={{
                        borderColor: "rgba(255, 193, 7, 0.2)",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-sticky-note me-2 text-info"></i>
                        Admin Notes
                        {selectedStatus !== incident.status && (
                          <span className="text-danger ms-1">*</span>
                        )}
                      </h6>
                    </div>
                    <div className="card-body" style={{ padding: "1rem" }}>
                      <textarea
                        className="form-control bg-white"
                        rows="3"
                        placeholder="Add notes about the status change, actions taken, or additional information..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        disabled={loading}
                      />
                      {selectedStatus !== incident.status &&
                        !adminNotes.trim() && (
                          <small className="text-danger mt-2 d-block">
                            Please provide notes explaining the status change
                          </small>
                        )}
                    </div>
                  </div>
                </div>

                {/* Notification Info */}
                {selectedStatus !== incident.status && (
                  <div className="col-12">
                    <div className="alert alert-info border-0">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-info-circle fa-lg me-3"></i>
                        <div>
                          <h6 className="alert-heading mb-1">Notification</h6>
                          <p className="mb-0">
                            The barangay reporter{" "}
                            <strong>{incident.reporter?.name}</strong> will be
                            notified of this status change via notification and
                            email.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top bg-white">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn fw-semibold position-relative"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  (selectedStatus !== incident.status && !adminNotes.trim())
                }
                style={{
                  backgroundColor: loading ? "var(--bs-secondary)" : "#ffc107",
                  borderColor: loading ? "var(--bs-secondary)" : "#ffc107",
                  color: "white",
                  transition: "all 0.3s ease",
                  minWidth: "140px",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#e0a800";
                    e.target.style.borderColor = "#e0a800";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 8px rgba(224, 168, 0, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#ffc107";
                    e.target.style.borderColor = "#ffc107";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default IncidentStatusModal;