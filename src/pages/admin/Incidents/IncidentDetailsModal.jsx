// components/admin/IncidentDetailsModal.jsx
import React, { useEffect } from 'react';
import Portal from '../../../components/Portal';

const IncidentDetailsModal = ({ incident, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    };
  }, []);

  const getSeverityBadge = (severity) => {
    const severityStyles = {
      Low: "bg-success text-white",
      Medium: "bg-warning text-dark",
      High: "bg-danger text-white",
      Critical: "bg-dark text-white"
    };
    return severityStyles[severity] || "bg-secondary text-white";
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Reported: "bg-primary text-white",
      Investigating: "bg-info text-white",
      Resolved: "bg-success text-white",
      Closed: "bg-secondary text-white"
    };
    return statusStyles[status] || "bg-secondary text-white";
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      Flood: "fa-water",
      Landslide: "fa-mountain",
      Fire: "fa-fire",
      Earthquake: "fa-house-damage",
      Vehicular: "fa-car-crash"
    };
    return typeIcons[type] || "fa-exclamation-triangle";
  };

  const getRoadStatusBadge = (status) => {
    const statusStyles = {
      PASSABLE: "bg-success text-white",
      NOT_PASSABLE: "bg-danger text-white"
    };
    return statusStyles[status] || "bg-secondary text-white";
  };

  // Local date formatting helpers
  const formatLocalDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date Error";
    }
  };

  const formatLocalTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Time";

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Time Error";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return `${formatLocalDate(dateString)} at ${formatLocalTime(dateString)}`;
    } catch (error) {
      return "Date Error";
    }
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
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
              }}
            >
              <h5 className="modal-title fw-bold">
                <i className="fas fa-eye me-2"></i>
                Incident Details
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            <div 
              className="modal-body bg-light" 
              style={{ 
                maxHeight: '70vh', 
                overflowY: 'auto',
              }}
            >
              <div className="row g-3">
                {/* Incident Header */}
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
                            <i className={`fas ${getTypeIcon(incident.incident_type)} text-white`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h4 className="mb-2 text-dark fw-bold">{incident.title}</h4>
                          <div className="d-flex flex-wrap gap-2">
                            <span className={`badge ${getSeverityBadge(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            <span className={`badge ${getStatusBadge(incident.status)}`}>
                              {incident.status}
                            </span>
                            <span className="badge bg-light text-dark border">
                              <i className={`fas ${getTypeIcon(incident.incident_type)} me-1`}></i>
                              {incident.incident_type}
                            </span>
                            {incident.completeness_score && (
                              <span className={`badge ${
                                incident.completeness_score >= 80 ? 'bg-success' : 
                                incident.completeness_score >= 60 ? 'bg-warning' : 'bg-secondary'
                              } text-white`}>
                                Data: {incident.completeness_score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="col-12 col-md-6">
                  <div 
                    className="card border-0 bg-white"
                    style={{ height: '100%' }}
                  >
                    <div 
                      className="card-header border-bottom bg-white"
                      style={{ 
                        borderColor: 'rgba(51, 107, 49, 0.2)',
                        padding: '0.75rem 1rem'
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        Basic Information
                      </h6>
                    </div>
                    <div 
                      className="card-body"
                      style={{ padding: '1rem' }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="form-label fw-semibold text-dark mb-1">
                          <i className="fas fa-map-marker-alt me-1 text-danger"></i>
                          Location
                        </label>
                        <div className="text-dark">{incident.location}</div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="form-label fw-semibold text-dark mb-1">
                          <i className="fas fa-calendar-alt me-1 text-info"></i>
                          Incident Date & Time
                        </label>
                        <div className="text-dark">
                          {formatLocalDate(incident.incident_date)} at {' '}
                          {formatLocalTime(incident.incident_date)}
                        </div>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-dark mb-1">
                          <i className="fas fa-clock me-1 text-secondary"></i>
                          Reported Date
                        </label>
                        <div className="text-dark">
                          {formatLocalDate(incident.created_at)} at {' '}
                          {formatLocalTime(incident.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="col-12 col-md-6">
                  <div 
                    className="card border-0 bg-white"
                    style={{ height: '100%' }}
                  >
                    <div 
                      className="card-header border-bottom bg-white"
                      style={{ 
                        borderColor: 'rgba(51, 107, 49, 0.2)',
                        padding: '0.75rem 1rem'
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-user me-2 text-dark"></i>
                        Reporter Information
                      </h6>
                    </div>
                    <div 
                      className="card-body"
                      style={{ padding: '1rem' }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="form-label fw-semibold text-dark mb-1">Reported By</label>
                        <div className="text-dark">{incident.reporter?.name || 'N/A'}</div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label className="form-label fw-semibold text-dark mb-1">Barangay</label>
                        <div className="text-dark">
                          {incident.reporter?.barangay_name || 'N/A'}, {incident.reporter?.municipality || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-dark mb-1">Contact</label>
                        <div className="text-dark">{incident.reporter?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Assessment */}
                <div className="col-12 col-md-6">
                  <div 
                    className="card border-0 bg-white"
                    style={{ height: '100%' }}
                  >
                    <div 
                      className="card-header border-bottom bg-white"
                      style={{ 
                        borderColor: 'rgba(51, 107, 49, 0.2)',
                        padding: '0.75rem 1rem'
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-chart-bar me-2 text-warning"></i>
                        Impact Assessment
                      </h6>
                    </div>
                    <div 
                      className="card-body"
                      style={{ padding: '1rem' }}
                    >
                      <div 
                        className="row text-center"
                        style={{ marginBottom: '1rem', gap: '0.75rem 0' }}
                      >
                        <div className="col-4">
                          <div className="h4 mb-1 fw-bold text-primary">{incident.affected_families}</div>
                          <small className="text-muted fw-semibold">Families</small>
                        </div>
                        <div className="col-4">
                          <div className="h4 mb-1 fw-bold text-info">{incident.affected_individuals}</div>
                          <small className="text-muted fw-semibold">Individuals</small>
                        </div>
                        <div className="col-4">
                          <div className="h4 mb-1 fw-bold text-danger">{incident.casualties?.dead || 0}</div>
                          <small className="text-muted fw-semibold">Deceased</small>
                        </div>
                      </div>
                      <div 
                        className="row text-center"
                        style={{ gap: '0.75rem 0' }}
                      >
                        <div className="col-6">
                          <div className="h4 mb-1 fw-bold text-warning">{incident.casualties?.injured || 0}</div>
                          <small className="text-muted fw-semibold">Injured</small>
                        </div>
                        <div className="col-6">
                          <div className="h4 mb-1 fw-bold text-secondary">{incident.casualties?.missing || 0}</div>
                          <small className="text-muted fw-semibold">Missing</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-white">
                    <div 
                      className="card-header border-bottom bg-white"
                      style={{ 
                        borderColor: 'rgba(51, 107, 49, 0.2)',
                        padding: '0.75rem 1rem'
                      }}
                    >
                      <h6 className="mb-0 fw-semibold text-dark">
                        <i className="fas fa-align-left me-2 text-success"></i>
                        Description
                      </h6>
                    </div>
                    <div 
                      className="card-body"
                      style={{ padding: '1rem' }}
                    >
                      <p className="mb-0 text-dark" style={{ lineHeight: "1.6" }}>
                        {incident.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Population Data */}
                {incident.population_data && (
                  <div className="col-12">
                    <div className="card border-0 bg-white">
                      <div 
                        className="card-header border-bottom bg-white"
                        style={{ 
                          borderColor: 'rgba(51, 107, 49, 0.2)',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        <h6 className="mb-0 fw-semibold text-dark">
                          <i className="fas fa-users me-2 text-info"></i>
                          Population Data
                        </h6>
                      </div>
                      <div 
                        className="card-body"
                        style={{ padding: '1rem' }}
                      >
                        <div className="row">
                          {/* Displacement and Assistance */}
                          <div className="col-12 col-md-6 mb-3">
                            <h6 className="fw-semibold text-primary mb-2">Displacement & Assistance</h6>
                            <div className="row text-center">
                              <div className="col-6 mb-2">
                                <div className="h5 mb-1 fw-bold text-warning">{incident.population_data.displaced_families}</div>
                                <small className="text-muted">Displaced Families</small>
                              </div>
                              <div className="col-6 mb-2">
                                <div className="h5 mb-1 fw-bold text-warning">{incident.population_data.displaced_persons}</div>
                                <small className="text-muted">Displaced Persons</small>
                              </div>
                              <div className="col-6 mb-2">
                                <div className="h5 mb-1 fw-bold text-info">{incident.population_data.families_requiring_assistance}</div>
                                <small className="text-muted">Families Needing Assistance</small>
                              </div>
                              <div className="col-6 mb-2">
                                <div className="h5 mb-1 fw-bold text-success">{incident.population_data.families_assisted}</div>
                                <small className="text-muted">Families Assisted</small>
                              </div>
                            </div>
                          </div>

                          {/* Gender Distribution */}
                          <div className="col-12 col-md-6 mb-3">
                            <h6 className="fw-semibold text-primary mb-2">Gender Distribution</h6>
                            <div className="row text-center">
                              <div className="col-4 mb-2">
                                <div className="h5 mb-1 fw-bold text-primary">{incident.population_data.male_count}</div>
                                <small className="text-muted">Male</small>
                              </div>
                              <div className="col-4 mb-2">
                                <div className="h5 mb-1 fw-bold text-danger">{incident.population_data.female_count}</div>
                                <small className="text-muted">Female</small>
                              </div>
                              <div className="col-4 mb-2">
                                <div className="h5 mb-1 fw-bold text-success">{incident.population_data.lgbtqia_count}</div>
                                <small className="text-muted">LGBTQIA+</small>
                              </div>
                            </div>
                          </div>

                          {/* Special Groups */}
                          <div className="col-12">
                            <h6 className="fw-semibold text-primary mb-2">Special Groups</h6>
                            <div className="row text-center">
                              {[
                                { label: 'PWD', value: incident.population_data.pwd_count, color: 'warning' },
                                { label: 'Pregnant', value: incident.population_data.pregnant_count, color: 'danger' },
                                { label: 'Elderly', value: incident.population_data.elderly_count, color: 'secondary' },
                                { label: 'Lactating Mothers', value: incident.population_data.lactating_mother_count, color: 'info' },
                                { label: 'Solo Parents', value: incident.population_data.solo_parent_count, color: 'primary' },
                                { label: 'Indigenous People', value: incident.population_data.indigenous_people_count, color: 'success' }
                              ].map((group, index) => (
                                <div key={index} className="col-4 col-md-2 mb-2">
                                  <div className={`h5 mb-1 fw-bold text-${group.color}`}>{group.value}</div>
                                  <small className="text-muted">{group.label}</small>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Infrastructure Status */}
                {incident.infrastructure_status && (
                  <div className="col-12">
                    <div className="card border-0 bg-white">
                      <div 
                        className="card-header border-bottom bg-white"
                        style={{ 
                          borderColor: 'rgba(51, 107, 49, 0.2)',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        <h6 className="mb-0 fw-semibold text-dark">
                          <i className="fas fa-road me-2 text-warning"></i>
                          Infrastructure Status
                        </h6>
                      </div>
                      <div 
                        className="card-body"
                        style={{ padding: '1rem' }}
                      >
                        <div className="row">
                          {/* Roads and Bridges */}
                          <div className="col-12 col-md-4 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="fw-semibold text-dark mb-0">Roads & Bridges</h6>
                              <span className={`badge ${getRoadStatusBadge(incident.infrastructure_status.roads_bridges_status)}`}>
                                {incident.infrastructure_status.roads_bridges_status}
                              </span>
                            </div>
                            {incident.infrastructure_status.roads_reported_not_passable && (
                              <div className="small text-muted">
                                Not Passable: {formatDateTime(incident.infrastructure_status.roads_reported_not_passable)}
                              </div>
                            )}
                            {incident.infrastructure_status.roads_reported_passable && (
                              <div className="small text-muted">
                                Passable: {formatDateTime(incident.infrastructure_status.roads_reported_passable)}
                              </div>
                            )}
                            {incident.infrastructure_status.roads_remarks && (
                              <div className="small text-dark mt-1">
                                <strong>Remarks:</strong> {incident.infrastructure_status.roads_remarks}
                              </div>
                            )}
                          </div>

                          {/* Power Supply */}
                          <div className="col-12 col-md-4 mb-3">
                            <h6 className="fw-semibold text-dark mb-2">Power Supply</h6>
                            {incident.infrastructure_status.power_outage_time && (
                              <div className="small text-muted">
                                Outage: {formatDateTime(incident.infrastructure_status.power_outage_time)}
                              </div>
                            )}
                            {incident.infrastructure_status.power_restored_time && (
                              <div className="small text-muted">
                                Restored: {formatDateTime(incident.infrastructure_status.power_restored_time)}
                              </div>
                            )}
                            {incident.infrastructure_status.power_remarks && (
                              <div className="small text-dark mt-1">
                                <strong>Remarks:</strong> {incident.infrastructure_status.power_remarks}
                              </div>
                            )}
                          </div>

                          {/* Communication Lines */}
                          <div className="col-12 col-md-4 mb-3">
                            <h6 className="fw-semibold text-dark mb-2">Communication Lines</h6>
                            {incident.infrastructure_status.communication_interruption_time && (
                              <div className="small text-muted">
                                Interrupted: {formatDateTime(incident.infrastructure_status.communication_interruption_time)}
                              </div>
                            )}
                            {incident.infrastructure_status.communication_restored_time && (
                              <div className="small text-muted">
                                Restored: {formatDateTime(incident.infrastructure_status.communication_restored_time)}
                              </div>
                            )}
                            {incident.infrastructure_status.communication_remarks && (
                              <div className="small text-dark mt-1">
                                <strong>Remarks:</strong> {incident.infrastructure_status.communication_remarks}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {incident.admin_notes && (
                  <div className="col-12">
                    <div className="card border-0 bg-white">
                      <div 
                        className="card-header border-bottom bg-white"
                        style={{ 
                          borderColor: 'rgba(51, 107, 49, 0.2)',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        <h6 className="mb-0 fw-semibold text-dark">
                          <i className="fas fa-sticky-note me-2 text-info"></i>
                          Admin Notes
                        </h6>
                      </div>
                      <div 
                        className="card-body"
                        style={{ padding: '1rem' }}
                      >
                        <p className="mb-0 text-dark" style={{ lineHeight: "1.6" }}>
                          {incident.admin_notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Response Actions */}
                {incident.response_actions && (
                  <div className="col-12">
                    <div className="card border-0 bg-white">
                      <div 
                        className="card-header border-bottom bg-white"
                        style={{ 
                          borderColor: 'rgba(51, 107, 49, 0.2)',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        <h6 className="mb-0 fw-semibold text-dark">
                          <i className="fas fa-tasks me-2 text-primary"></i>
                          Response Actions
                        </h6>
                      </div>
                      <div 
                        className="card-body"
                        style={{ padding: '1rem' }}
                      >
                        <p className="mb-0 text-dark" style={{ lineHeight: "1.6" }}>
                          {incident.response_actions}
                        </p>
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
                className="btn btn-primary text-white fw-semibold"
                onClick={onClose}
              >
                <i className="fas fa-times me-2"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default IncidentDetailsModal;