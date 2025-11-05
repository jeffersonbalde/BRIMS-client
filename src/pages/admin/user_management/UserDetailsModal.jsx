// components/admin/UserDetailsModal.jsx
import React, { useState } from "react";
import Portal from "../../../components/Portal";

// Avatar component for consistent rendering
const UserAvatar = ({ user, size = 40 }) => {
  const [avatarError, setAvatarError] = useState(false);
  
  const handleImageError = () => {
    setAvatarError(true);
  };

  // Format avatar URL with better error handling
  const formatAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    // Check if it's already a full URL
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // Extract filename from path
    const filename = avatarPath.split('/').pop();
    return `${import.meta.env.VITE_LARAVEL_API}/avatar/${filename}`;
  };

  if (user.avatar && !avatarError) {
    return (
      <img
        src={formatAvatarUrl(user.avatar)}
        alt={user.name}
        className="rounded-circle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "cover",
        }}
        onError={handleImageError}
      />
    );
  }

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center text-white"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "var(--primary-color)",
        background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
        fontSize: `${size * 0.4}px`,
      }}
    >
      <i className="fas fa-user"></i>
    </div>
  );
};

const UserDetailsModal = ({ user, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    document.body.classList.add("modal-open");
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.classList.remove("modal-open");
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusInfo = (user) => {
    const statusInfo = {
      pending: { label: "Pending Approval", color: "warning", icon: "fa-clock" },
      approved: { label: "Approved", color: "success", icon: "fa-check-circle" },
      rejected: { label: "Rejected", color: "danger", icon: "fa-times-circle" },
    };

    return statusInfo[user.status] || { label: "Unknown", color: "secondary", icon: "fa-question" };
  };

  const getActivityInfo = (user) => {
    if (user.is_active) {
      return { label: "Active", color: "success", icon: "fa-check" };
    } else {
      return { label: "Deactivated", color: "danger", icon: "fa-times" };
    }
  };

  const statusInfo = getStatusInfo(user);
  const activityInfo = getActivityInfo(user);

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
                background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
              }}
            >
              <h5 className="modal-title fw-bold">
                <i className="fas fa-user me-2"></i>
                User Details
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body bg-light" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* User Summary Card */}
              <div className="card border-0 bg-white mb-4">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      {/* Use the UserAvatar component here */}
                      <UserAvatar user={user} size={80} />
                    </div>
                    <div className="col">
                      <h4 className="mb-1 text-dark">{user.name}</h4>
                      <p className="text-muted mb-2">{user.email}</p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className={`badge bg-${statusInfo.color} fs-6`}>
                          <i className={`fas ${statusInfo.icon} me-1`}></i>
                          {statusInfo.label}
                        </span>
                        <span className={`badge bg-${activityInfo.color} fs-6`}>
                          <i className={`fas ${activityInfo.icon} me-1`}></i>
                          {activityInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {/* Basic Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        Basic Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                        <p className="mb-0 fw-semibold text-dark">{user.name}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
                        <p className="mb-0 fw-semibold text-dark">{user.email}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Contact Number</label>
                        <p className="mb-0 fw-semibold text-dark">{user.contact || "N/A"}</p>
                      </div>
                      <div>
                        <label className="form-label small fw-semibold text-muted mb-1">Position/Role</label>
                        <p className="mb-0 fw-semibold text-dark">{user.position || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barangay Information */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white h-100">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-map-marker-alt me-2 text-success"></i>
                        Barangay Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Barangay Name</label>
                        <p className="mb-0 fw-semibold text-dark">{user.barangay_name || "N/A"}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Municipality</label>
                        <p className="mb-0 fw-semibold text-dark">{user.municipality || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Timeline */}
                <div className="col-12">
                  <div className="card border-0 bg-white">
                    <div className="card-header bg-transparent border-bottom-0">
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-history me-2 text-info"></i>
                        Account Timeline
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Registration Date</label>
                          <p className="mb-0 fw-semibold text-dark">{formatDate(user.created_at)}</p>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label small fw-semibold text-muted mb-1">Approval Date</label>
                          <p className="mb-0 fw-semibold text-dark">
                            {user.approved_at ? formatDate(user.approved_at) : "Not Approved"}
                          </p>
                        </div>
                        {user.rejected_at && (
                          <div className="col-12 col-md-6 mb-3">
                            <label className="form-label small fw-semibold text-muted mb-1">Rejection Date</label>
                            <p className="mb-0 fw-semibold text-dark">{formatDate(user.rejected_at)}</p>
                            {user.rejection_reason && (
                              <>
                                <label className="form-label small fw-semibold text-muted mb-1 mt-2">Rejection Reason</label>
                                <p className="mb-0 fw-semibold text-dark">{user.rejection_reason}</p>
                              </>
                            )}
                          </div>
                        )}
                        {user.deactivated_at && (
                          <div className="col-12 col-md-6 mb-3">
                            <label className="form-label small fw-semibold text-muted mb-1">Deactivation Date</label>
                            <p className="mb-0 fw-semibold text-dark">{formatDate(user.deactivated_at)}</p>
                            {user.deactivation_reason && (
                              <>
                                <label className="form-label small fw-semibold text-muted mb-1 mt-2">Deactivation Reason</label>
                                <p className="mb-0 fw-semibold text-dark">{user.deactivation_reason}</p>
                              </>
                            )}
                          </div>
                        )}
                        {user.reactivated_at && (
                          <div className="col-12 col-md-6 mb-3">
                            <label className="form-label small fw-semibold text-muted mb-1">Reactivation Date</label>
                            <p className="mb-0 fw-semibold text-dark">{formatDate(user.reactivated_at)}</p>
                          </div>
                        )}
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
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default UserDetailsModal;