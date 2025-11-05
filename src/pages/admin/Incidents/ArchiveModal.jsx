// components/admin/ArchiveModal.jsx
import React, { useState } from 'react';
import Portal from '../../../components/Portal';
import { showAlert, showToast } from '../../../services/notificationService';

const ArchiveModal = ({ incident, onClose, onArchive, loading }) => {
  const [archiveReason, setArchiveReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape' && !loading) {
      e.preventDefault();
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    };
  }, [loading]);

  const handleSubmit = async () => {
    if (!archiveReason) {
      showToast.error("Please select an archive reason");
      return;
    }

    const finalReason = archiveReason === "other" ? customReason : archiveReason;
    
    if (archiveReason === "other" && !customReason.trim()) {
      showToast.error("Please specify the archive reason");
      return;
    }

    // Show confirmation dialog before archiving
    const confirmation = await showAlert.confirm(
      'Confirm Archive Incident',
      `Are you sure you want to archive this incident?\n\nIncident Details:\n• Title: ${incident.title}\n• Type: ${incident.incident_type}\n• Location: ${incident.location}\n• Current Status: ${incident.status}\n\nArchive Reason: ${finalReason}\n\nThis action will:\n• Move incident to "Archived" status\n• Remove from active incident lists\n• Notify the barangay reporter\n• Preserve data for audit purposes`,
      'Yes, Archive Incident',
      'Cancel'
    );

    if (!confirmation.isConfirmed) {
      return; // User cancelled the confirmation
    }

    // Show processing SweetAlert
    showAlert.processing(
      'Archiving Incident',
      'Please wait while we archive the incident...'
    );

    // Call the archive function
    onArchive(incident.id, finalReason);
  };

  const archiveReasons = [
    { value: "duplicate", label: "Duplicate Entry", description: "This incident has been reported multiple times" },
    { value: "test_data", label: "Test/Development Data", description: "This incident was created for testing purposes" },
    { value: "incorrect_info", label: "Incorrect Information", description: "The reported information is inaccurate or false" },
    { value: "resolved_offline", label: "Resolved Offline", description: "This incident was resolved through other channels" },
    { value: "spam", label: "Spam/Inappropriate", description: "This incident contains spam or inappropriate content" },
    { value: "other", label: "Other Reason", description: "Specify the reason below" }
  ];

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
      Archived: "bg-secondary text-white",
    };
    return statusStyles[status] || "bg-secondary text-white";
  };

  return (
    <Portal>
      <div 
        className="modal fade show d-block"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg mx-3 mx-sm-auto">
          <div 
            className="modal-content border-0"
            style={{ 
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div 
              className="modal-header border-0 text-white"
              style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              }}
            >
              <h5 className="modal-title fw-bold">
                <i className="fas fa-archive me-2"></i>
                Archive Incident
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
                maxHeight: '60vh', 
                overflowY: 'auto',
              }}
            >
              <div className="row g-3">
                {/* Warning Alert */}
                <div className="col-12">
                  <div className="alert alert-warning border-0">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle fa-lg me-3"></i>
                      <div>
                        <h6 className="alert-heading mb-1">Archive Warning</h6>
                        <p className="mb-0">
                          Archiving will remove this incident from active views but preserve it for audit purposes. 
                          The barangay reporter will be notified.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

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
                              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)'
                            }}
                          >
                            <i className="fas fa-exclamation-triangle text-white"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold text-dark">{incident.title}</h6>
                          <div className="d-flex flex-wrap gap-2">
                            <span className={`badge ${getSeverityBadge(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            <span className={`badge ${getStatusBadge(incident.status)}`}>
                              {incident.status}
                            </span>
                            <span className="badge bg-light text-dark border">
                              {incident.incident_type}
                            </span>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {incident.location} • {incident.reporter?.barangay_name} • 
                            Reported by {incident.reporter?.name}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Archive Reason Selection */}
                <div className="col-12">
                  <div className="card border-0 bg-white">
                    <div 
                      className="card-header border-bottom bg-white"
                      style={{ 
                        borderColor: 'rgba(220, 53, 69, 0.2)',
                        padding: '0.75rem 1rem'
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-clipboard-list me-2 text-danger"></i>
                        Archive Reason
                        <span className="text-danger ms-1">*</span>
                      </h6>
                    </div>
                    <div 
                      className="card-body"
                      style={{ padding: '1rem' }}
                    >
                      <select
                        className="form-select bg-white mb-3"
                        value={archiveReason}
                        onChange={(e) => setArchiveReason(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select a reason...</option>
                        {archiveReasons.map(reason => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>

                      {archiveReason && (
                        <div className="alert alert-info border-0">
                          <small>
                            <i className="fas fa-info-circle me-1"></i>
                            {archiveReasons.find(r => r.value === archiveReason)?.description}
                          </small>
                        </div>
                      )}

                      {archiveReason === "other" && (
                        <div className="mt-3">
                          <label className="form-label fw-semibold text-dark">
                            Specify Reason
                            <span className="text-danger ms-1">*</span>
                          </label>
                          <textarea
                            className="form-control bg-white"
                            rows="3"
                            placeholder="Please provide specific details for archiving this incident..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            disabled={loading}
                          />
                          <small className="text-muted">
                            Provide clear explanation for future reference
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Impact Information */}
                <div className="col-12">
                  <div className="alert alert-info border-0">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-info-circle fa-lg me-3"></i>
                      <div>
                        <h6 className="alert-heading mb-1">What happens after archiving?</h6>
                        <ul className="mb-0 ps-3">
                          <li>Incident will be moved to "Archived" status</li>
                          <li>Removed from active incident lists</li>
                          <li>Barangay reporter will be notified</li>
                          <li>Data preserved for audit and reporting</li>
                          <li>Can be restored by administrators if needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
                disabled={loading || !archiveReason || (archiveReason === "other" && !customReason.trim())}
                style={{
                  backgroundColor: loading ? 'var(--bs-secondary)' : '#dc3545',
                  borderColor: loading ? 'var(--bs-secondary)' : '#dc3545',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#c82333';
                    e.target.style.borderColor = '#c82333';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#dc3545';
                    e.target.style.borderColor = '#dc3545';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Archiving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-archive me-2"></i>
                    Archive Incident
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

export default ArchiveModal;