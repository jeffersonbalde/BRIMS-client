// components/admin/UnarchiveModal.jsx
import React, { useState } from 'react';
import Portal from '../../../components/Portal';
import { showAlert, showToast } from '../../../services/notificationService';

const UnarchiveModal = ({ incident, onClose, onUnarchive, loading }) => {
  const [unarchiveReason, setUnarchiveReason] = useState("");
  const [newStatus, setNewStatus] = useState("Reported");

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
    if (!unarchiveReason.trim()) {
      showToast.error("Please provide a reason for unarchiving");
      return;
    }

    // Show confirmation dialog before unarchiving
    const confirmation = await showAlert.confirm(
      'Confirm Unarchive Incident',
      `Are you sure you want to unarchive this incident?\n\nIncident Details:\n• Title: ${incident.title}\n• Type: ${incident.incident_type}\n• Location: ${incident.location}\n• New Status: ${newStatus}\n\nUnarchive Reason: ${unarchiveReason}\n\nThis action will:\n• Restore incident to active status\n• Make it visible in incident lists\n• Notify the barangay reporter\n• Preserve archive history for audit`,
      'Yes, Unarchive Incident',
      'Cancel'
    );

    if (!confirmation.isConfirmed) {
      return; // User cancelled the confirmation
    }

    // Show processing SweetAlert
    showAlert.processing(
      'Unarchiving Incident',
      'Please wait while we restore the incident...'
    );

    // Call the unarchive function
    onUnarchive(incident.id, unarchiveReason, newStatus);
  };

  const statusOptions = [
    { value: "Reported", label: "Reported", description: "Set back to initial reported status" },
    { value: "Investigating", label: "Investigating", description: "Set to under investigation" },
    { value: "Resolved", label: "Resolved", description: "Mark as resolved" }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
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
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              }}
            >
              <h5 className="modal-title fw-bold">
                <i className="fas fa-box-open me-2"></i>
                Unarchive Incident
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
                {/* Success Alert */}
                <div className="col-12">
                  <div className="alert alert-success border-0">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle fa-lg me-3"></i>
                      <div>
                        <h6 className="alert-heading mb-1">Restore Incident</h6>
                        <p className="mb-0">
                          This incident will be restored to active status and will appear in regular incident lists.
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
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                            }}
                          >
                            <i className="fas fa-exclamation-triangle text-white"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold text-dark">{incident.title}</h6>
                          <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-secondary">
                              Currently: Archived
                            </span>
                            <span className="badge bg-light text-dark border">
                              {incident.incident_type}
                            </span>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {incident.location} • {incident.reporter?.barangay_name}
                          </small>
                          {incident.archive_reason && (
                            <small className="text-muted d-block mt-1">
                              <strong>Archived Reason:</strong> {incident.archive_reason}
                            </small>
                          )}
                          {incident.archived_at && (
                            <small className="text-muted d-block">
                              <strong>Archived on:</strong> {formatDate(incident.archived_at)}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Status Selection */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white">
                    <div 
                      className="card-header border-bottom bg-white"
                      style={{ 
                        borderColor: 'rgba(40, 167, 69, 0.2)',
                        padding: '0.75rem 1rem'
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-flag me-2 text-success"></i>
                        New Status
                        <span className="text-danger ms-1">*</span>
                      </h6>
                    </div>
                    <div 
                      className="card-body"
                      style={{ padding: '1rem' }}
                    >
                      <select
                        className="form-select bg-white"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={loading}
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted mt-2 d-block">
                        {statusOptions.find(s => s.value === newStatus)?.description}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Unarchive Reason */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white">
                    <div 
                      className="card-header border-bottom bg-white"
                      style={{ 
                        borderColor: 'rgba(40, 167, 69, 0.2)',
                        padding: '0.75rem 1rem'
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-clipboard-list me-2 text-info"></i>
                        Unarchive Reason
                        <span className="text-danger ms-1">*</span>
                      </h6>
                    </div>
                    <div 
                      className="card-body"
                      style={{ padding: '1rem' }}
                    >
                      <textarea
                        className="form-control bg-white"
                        rows="3"
                        placeholder="Explain why this incident should be restored to active status..."
                        value={unarchiveReason}
                        onChange={(e) => setUnarchiveReason(e.target.value)}
                        disabled={loading}
                      />
                      <small className="text-muted">
                        Provide clear explanation for audit purposes
                      </small>
                    </div>
                  </div>
                </div>

                {/* Impact Information */}
                <div className="col-12">
                  <div className="alert alert-info border-0">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-info-circle fa-lg me-3"></i>
                      <div>
                        <h6 className="alert-heading mb-1">What happens after unarchiving?</h6>
                        <ul className="mb-0 ps-3">
                          <li>Incident will be moved to selected status ({newStatus})</li>
                          <li>Will appear in active incident lists</li>
                          <li>Barangay reporter will be notified</li>
                          <li>Archive history will be preserved</li>
                          <li>Can be archived again if needed</li>
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
                disabled={loading || !unarchiveReason.trim()}
                style={{
                  backgroundColor: loading ? 'var(--bs-secondary)' : '#28a745',
                  borderColor: loading ? 'var(--bs-secondary)' : '#28a745',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#218838';
                    e.target.style.borderColor = '#218838';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#28a745';
                    e.target.style.borderColor = '#28a745';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Unarchiving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-box-open me-2"></i>
                    Unarchive Incident
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

export default UnarchiveModal;