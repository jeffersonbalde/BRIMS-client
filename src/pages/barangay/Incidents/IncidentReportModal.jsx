// components/incident/IncidentReportModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { showAlert, showToast } from '../../../services/notificationService';
import Portal from '../../../components/Portal';

const IncidentReportModal = ({ onClose, onSuccess }) => {
const initialFormState = {
  incident_type: 'Flood',
  title: '',
  description: '',
  location: '',
  incident_date: (() => {
    // Get current local date and time for datetime-local input
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  })(),
  severity: 'Medium',
  affected_families: '',
  affected_individuals: '',
  casualties: { dead: 0, injured: 0, missing: 0 }
};

  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const formRef = useRef(null);
  const { token } = useAuth();

  // Check if form has changes
  const checkFormChanges = (currentForm) => {
    return JSON.stringify(currentForm) !== JSON.stringify(initialFormState);
  };

  const validateForm = () => {
    const errors = {};

    // Check if affected numbers are at least 1
    if (!form.affected_families || parseInt(form.affected_families) < 1) {
      errors.affected_families = 'Please enter at least 1 affected family';
    }

    if (!form.affected_individuals || parseInt(form.affected_individuals) < 1) {
      errors.affected_individuals = 'Please enter at least 1 affected individual';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form before submission
  if (!validateForm()) {
    showAlert.error('Validation Error', 'Please check the form for errors');
    return;
  }

  // Show confirmation dialog before submitting
// Show confirmation dialog before submitting
const confirmation = await showAlert.confirm(
  'Confirm Incident Report',
  `Are you sure you want to report this incident?\n\nIncident Details:\n• Type: ${form.incident_type}\n• Title: ${form.title}\n• Location: ${form.location}\n• Severity: ${form.severity}\n\nThis action will notify administrators and cannot be undone.`,
  'Yes, Report Incident',
  'Review Details'
);

  if (!confirmation.isConfirmed) {
    return; // User cancelled the confirmation
  }

  setIsSubmitting(true);

  try {
    // Show processing SweetAlert - don't await it
    showAlert.processing(
      'Reporting Incident',
      'Please wait while we save your incident report...'
    );

    // Convert datetime-local to ISO string for backend
    const localDate = new Date(form.incident_date);
    const isoDate = localDate.toISOString();

    // Prepare data for submission (convert empty strings to 0 for numbers)
    const submissionData = {
      ...form,
      incident_date: isoDate, // Send as ISO string to backend
      affected_families: parseInt(form.affected_families) || 0,
      affected_individuals: parseInt(form.affected_individuals) || 0,
      casualties: {
        dead: parseInt(form.casualties.dead) || 0,
        injured: parseInt(form.casualties.injured) || 0,
        missing: parseInt(form.casualties.missing) || 0
      }
    };

    const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/incidents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    const data = await response.json();

    // Close the processing alert
    showAlert.close();

    if (response.ok) {
      // Use custom success method
      await showAlert.customSuccess(
        'Incident Reported Successfully!',
        `
          <div class="text-start">
            <p>Your incident has been reported and administrators have been notified.</p>
            <p><strong>Please check your email for confirmation and further updates.</strong></p>
            <p>You will receive notifications when the incident status changes.</p>
          </div>
        `,
        'Okay, Got It'
      );
      
      setHasUnsavedChanges(false);
      onSuccess();
    } else {
      showAlert.error('Error', data.message || 'Failed to report incident');
    }
  } catch (error) {
    // Close the processing alert on error
    showAlert.close();
    showAlert.error('Error', 'Failed to connect to server');
  } finally {
    setIsSubmitting(false);
  }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      setHasUnsavedChanges(checkFormChanges(newForm));
      
      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
      
      return newForm;
    });
  };

  const handleCasualtyChange = (field, value) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        casualties: {
          ...prev.casualties,
          [field]: value
        }
      };
      setHasUnsavedChanges(checkFormChanges(newForm));
      return newForm;
    });
  };

  const handleBackdropClick = async (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      await handleCloseAttempt();
    }
  };

  const handleEscapeKey = async (e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      e.preventDefault();
      await handleCloseAttempt();
    }
  };

  const handleCloseAttempt = async () => {
    if (hasUnsavedChanges) {
      const result = await showAlert.confirm(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close without saving?',
        'Yes, Close',
        'Continue Editing'
      );
      
      if (result.isConfirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleCloseButtonClick = async () => {
    await handleCloseAttempt();
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
  }, [isSubmitting, hasUnsavedChanges]);

  const incidentTypes = [
    { value: 'Flood', icon: 'fa-water', label: 'Flood' },
    { value: 'Landslide', icon: 'fa-mountain', label: 'Landslide' },
    { value: 'Fire', icon: 'fa-fire', label: 'Fire' },
    { value: 'Earthquake', icon: 'fa-house-damage', label: 'Earthquake' },
    { value: 'Vehicular', icon: 'fa-car-crash', label: 'Vehicular Accident' },
  ];

  const severityLevels = [
    { value: 'Low', color: 'success', label: 'Low' },
    { value: 'Medium', color: 'warning', label: 'Medium' },
    { value: 'High', color: 'danger', label: 'High' },
    { value: 'Critical', color: 'dark', label: 'Critical' },
  ];

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
                <i className="fas fa-exclamation-triangle me-2"></i>
                Report New Incident
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={handleCloseButtonClick}
                disabled={isSubmitting}
                aria-label="Close"
              ></button>
            </div>
            
            <form ref={formRef} onSubmit={handleSubmit}>
              <div 
                className="modal-body bg-light" 
                style={{ 
                  maxHeight: '60vh', 
                  overflowY: 'auto',
                }}
              >
                <div className="row g-3">
                  {/* Incident Type */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark">Incident Type *</label>
                    <select 
                      name="incident_type"
                      value={form.incident_type}
                      onChange={handleInputChange}
                      className="form-select bg-white"
                      required
                      disabled={isSubmitting}
                    >
                      {incidentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Severity Level */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark">Severity Level *</label>
                    <select 
                      name="severity"
                      value={form.severity}
                      onChange={handleInputChange}
                      className="form-select bg-white"
                      required
                      disabled={isSubmitting}
                    >
                      {severityLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-dark">Incident Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      className="form-control bg-white"
                      placeholder="Brief title describing the incident"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Location */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleInputChange}
                      className="form-control bg-white"
                      placeholder="Specific location within barangay"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark">Incident Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="incident_date"
                      value={form.incident_date}
                      onChange={handleInputChange}
                      className="form-control bg-white"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold text-dark">Description *</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      className="form-control bg-white"
                      rows="3"
                      placeholder="Detailed description of the incident..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Affected Numbers */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark">Affected Families *</label>
                    <input
                      type="number"
                      name="affected_families"
                      value={form.affected_families}
                      onChange={handleInputChange}
                      className={`form-control bg-white ${formErrors.affected_families ? 'is-invalid' : ''}`}
                      min="1"
                      placeholder="Enter number of affected families"
                      required
                      disabled={isSubmitting}
                    />
                    {formErrors.affected_families && (
                      <div className="invalid-feedback">
                        {formErrors.affected_families}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark">Affected Individuals *</label>
                    <input
                      type="number"
                      name="affected_individuals"
                      value={form.affected_individuals}
                      onChange={handleInputChange}
                      className={`form-control bg-white ${formErrors.affected_individuals ? 'is-invalid' : ''}`}
                      min="1"
                      placeholder="Enter number of affected individuals"
                      required
                      disabled={isSubmitting}
                    />
                    {formErrors.affected_individuals && (
                      <div className="invalid-feedback">
                        {formErrors.affected_individuals}
                      </div>
                    )}
                  </div>

                  {/* Casualties Section */}
                  <div className="col-12">
                    <div className="card border-0 bg-white">
                      <div 
                        className="card-header border-bottom py-3 bg-white"
                        style={{ 
                          borderColor: 'rgba(51, 107, 49, 0.2)'
                        }}
                      >
                        <h6 className="mb-0 fw-semibold text-dark">
                          <i className="fas fa-heartbeat me-2 text-danger"></i>
                          Casualties (Optional)
                        </h6>
                      </div>
                      <div className="card-body p-3 bg-white">
                        <div className="row g-3">
                          <div className="col-12 col-md-4">
                            <label className="form-label fw-semibold text-dark">
                              <i className="fas fa-skull-crossbones me-1 text-muted"></i>
                              Deceased
                            </label>
                            <input
                              type="number"
                              value={form.casualties.dead}
                              onChange={(e) => handleCasualtyChange('dead', e.target.value)}
                              className="form-control bg-white"
                              min="0"
                              placeholder="0"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label fw-semibold text-dark">
                              <i className="fas fa-user-injured me-1 text-warning"></i>
                              Injured
                            </label>
                            <input
                              type="number"
                              value={form.casualties.injured}
                              onChange={(e) => handleCasualtyChange('injured', e.target.value)}
                              className="form-control bg-white"
                              min="0"
                              placeholder="0"
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <label className="form-label fw-semibold text-dark">
                              <i className="fas fa-search me-1 text-info"></i>
                              Missing
                            </label>
                            <input
                              type="number"
                              value={form.casualties.missing}
                              onChange={(e) => handleCasualtyChange('missing', e.target.value)}
                              className="form-control bg-white"
                              min="0"
                              placeholder="0"
                              disabled={isSubmitting}
                            />
                          </div>
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
                  onClick={handleCloseButtonClick}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
<button 
  type="submit" 
  className="btn fw-semibold position-relative"
  disabled={isSubmitting}
  style={{
    backgroundColor: isSubmitting ? 'var(--bs-secondary)' : 'var(--btn-primary-bg)',
    borderColor: isSubmitting ? 'var(--bs-secondary)' : 'var(--btn-primary-bg)',
    color: 'white',
    transition: 'all 0.3s ease',
    minWidth: '140px'
  }}
  onMouseEnter={(e) => {
    if (!isSubmitting) {
      e.target.style.backgroundColor = '#1a3d15';
      e.target.style.borderColor = '#1a3d15';
      e.target.style.transform = 'translateY(-1px)';
      e.target.style.boxShadow = '0 4px 8px rgba(26, 61, 21, 0.3)';
    }
  }}
  onMouseLeave={(e) => {
    if (!isSubmitting) {
      e.target.style.backgroundColor = 'var(--btn-primary-bg)';
      e.target.style.borderColor = 'var(--btn-primary-bg)';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }
  }}
  onMouseDown={(e) => {
    if (!isSubmitting) {
      e.target.style.transform = 'translateY(0)';
    }
  }}
>
  {isSubmitting ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Reporting...
    </>
  ) : (
    <>
      <i className="fas fa-paper-plane me-2"></i>
      Report Incident
    </>
  )}
</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default IncidentReportModal;