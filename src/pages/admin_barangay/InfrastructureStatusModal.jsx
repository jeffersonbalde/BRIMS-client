// components/incident/InfrastructureStatusModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { showAlert, showToast } from '../../services/notificationService';
import Portal from '../../components/Portal';

const InfrastructureStatusModal = ({ incident, onClose, onSuccess }) => {
  const initialFormState = {
    // Roads and Bridges
    roads_bridges_status: 'PASSABLE',
    roads_reported_not_passable: '',
    roads_reported_passable: '',
    roads_remarks: '',
    
    // Power Supply
    power_outage_time: '',
    power_restored_time: '',
    power_remarks: '',
    
    // Communication Lines
    communication_interruption_time: '',
    communication_restored_time: '',
    communication_remarks: ''
  };

  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [existingData, setExistingData] = useState(null);
  const formRef = useRef(null);
  const { token } = useAuth();

// Replace the InfrastructureSkeleton component in InfrastructureStatusModal.jsx
const InfrastructureSkeleton = () => (
  <div 
    className="modal-content border-0"
    style={{ 
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      maxHeight: '70vh',
      overflow: 'hidden'
    }}
  >
    {/* Header Skeleton */}
    <div className="modal-header border-0 text-white" style={{
      background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
    }}>
      <div className="w-100">
        <div className="skeleton-line mb-1" style={{ width: '60%', height: '20px' }}></div>
        <div className="skeleton-line" style={{ width: '40%', height: '14px' }}></div>
      </div>
    </div>
    
    <div className="modal-body bg-light p-3" style={{ maxHeight: '55vh', overflow: 'hidden' }}>
      <div className="row g-3">
        {/* Roads and Bridges Section Skeleton */}
        <div className="col-12">
          <div className="card border-0 bg-white">
            <div className="card-header border-bottom py-2 bg-white" style={{ borderColor: 'rgba(255, 193, 7, 0.2)' }}>
              <div className="skeleton-line" style={{ width: '40%', height: '16px' }}></div>
            </div>
            <div className="card-body p-2 bg-white">
              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <div className="skeleton-line mb-1" style={{ width: '30%', height: '14px' }}></div>
                  <div className="skeleton-box" style={{ height: '38px' }}></div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="skeleton-line mb-1" style={{ width: '50%', height: '14px' }}></div>
                  <div className="skeleton-box" style={{ height: '38px' }}></div>
                </div>
                <div className="col-12">
                  <div className="skeleton-line mb-1" style={{ width: '20%', height: '14px' }}></div>
                  <div className="skeleton-box" style={{ height: '60px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Power Supply Section Skeleton */}
        <div className="col-12 col-md-6">
          <div className="card border-0 bg-white">
            <div className="card-header border-bottom py-2 bg-white" style={{ borderColor: 'rgba(255, 193, 7, 0.2)' }}>
              <div className="skeleton-line" style={{ width: '35%', height: '16px' }}></div>
            </div>
            <div className="card-body p-2 bg-white">
              <div className="row g-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="col-12">
                    <div className="skeleton-line mb-1" style={{ width: '40%', height: '14px' }}></div>
                    <div className="skeleton-box" style={{ height: '38px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Communication Lines Section Skeleton */}
        <div className="col-12 col-md-6">
          <div className="card border-0 bg-white">
            <div className="card-header border-bottom py-2 bg-white" style={{ borderColor: 'rgba(255, 193, 7, 0.2)' }}>
              <div className="skeleton-line" style={{ width: '45%', height: '16px' }}></div>
            </div>
            <div className="card-body p-2 bg-white">
              <div className="row g-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="col-12">
                    <div className="skeleton-line mb-1" style={{ width: '50%', height: '14px' }}></div>
                    <div className="skeleton-box" style={{ height: '38px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Skeleton */}
    <div className="modal-footer border-top bg-white py-2">
      <div className="skeleton-box" style={{ width: '80px', height: '36px' }}></div>
      <div className="skeleton-box" style={{ width: '150px', height: '36px' }}></div>
    </div>
  </div>
);

  // Load existing data when modal opens
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_LARAVEL_API}/incidents/${incident.id}/infrastructure-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setExistingData(data.data);
            // Pre-fill form with existing data
            const filledForm = {
              roads_bridges_status: data.data.roads_bridges_status || 'PASSABLE',
              roads_reported_not_passable: data.data.roads_reported_not_passable ? 
                formatDateTimeForInput(data.data.roads_reported_not_passable) : '',
              roads_reported_passable: data.data.roads_reported_passable ? 
                formatDateTimeForInput(data.data.roads_reported_passable) : '',
              roads_remarks: data.data.roads_remarks || '',
              power_outage_time: data.data.power_outage_time ? 
                formatDateTimeForInput(data.data.power_outage_time) : '',
              power_restored_time: data.data.power_restored_time ? 
                formatDateTimeForInput(data.data.power_restored_time) : '',
              power_remarks: data.data.power_remarks || '',
              communication_interruption_time: data.data.communication_interruption_time ? 
                formatDateTimeForInput(data.data.communication_interruption_time) : '',
              communication_restored_time: data.data.communication_restored_time ? 
                formatDateTimeForInput(data.data.communication_restored_time) : '',
              communication_remarks: data.data.communication_remarks || ''
            };
            setForm(filledForm);
          }
        }
      } catch (error) {
        console.error("Error loading infrastructure data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [incident.id, token]);

  // Helper function to format datetime for input fields
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Check if form has changes
  const checkFormChanges = (currentForm) => {
    return JSON.stringify(currentForm) !== JSON.stringify(initialFormState);
  };

  const validateForm = () => {
    const errors = {};

    // Validate that if status is NOT_PASSABLE, reported time should be provided
    if (form.roads_bridges_status === 'NOT_PASSABLE' && !form.roads_reported_not_passable) {
      errors.roads_reported_not_passable = 'Please provide date and time when road became not passable';
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
    const confirmation = await showAlert.confirm(
      'Confirm Infrastructure Status',
      `Are you sure you want to ${existingData ? 'update' : 'save'} infrastructure status for this incident?\n\nIncident: ${incident.title}\n\nThis information is critical for emergency response planning.`,
      `Yes, ${existingData ? 'Update' : 'Save'} Status`,
      'Review Data'
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Show processing SweetAlert
      showAlert.processing(
        `${existingData ? 'Updating' : 'Saving'} Infrastructure Status`,
        `Please wait while we ${existingData ? 'update' : 'save'} the infrastructure data...`
      );

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/incidents/${incident.id}/infrastructure-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      // Close the processing alert
      showAlert.close();

      if (response.ok) {
        await showAlert.customSuccess(
          `Infrastructure Status ${existingData ? 'Updated' : 'Saved'}!`,
          `
            <div class="text-start">
              <p>Infrastructure status has been ${existingData ? 'updated' : 'saved'} successfully for incident:</p>
              <p><strong>${incident.title}</strong></p>
              <p>This information will help in coordinating emergency response efforts.</p>
            </div>
          `,
          'Okay, Got It'
        );
        
        setHasUnsavedChanges(false);
        onSuccess();
      } else {
        showAlert.error('Error', data.message || `Failed to ${existingData ? 'update' : 'save'} infrastructure status`);
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

  const handleBackdropClick = async (e) => {
    if (e.target === e.currentTarget && !isSubmitting && !isLoading) {
      await handleCloseAttempt();
    }
  };

  const handleEscapeKey = async (e) => {
    if (e.key === 'Escape' && !isSubmitting && !isLoading) {
      e.preventDefault();
      await handleCloseAttempt();
    }
  };

  const handleCloseAttempt = async () => {
    if (hasUnsavedChanges) {
      const result = await showAlert.confirm(
        'Unsaved Changes',
        'You have unsaved infrastructure status data. Are you sure you want to close without saving?',
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

  // Helper function to get current datetime for input fields
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
  }, [isSubmitting, hasUnsavedChanges, isLoading]);

  return (
    <Portal>
      <div 
        className="modal fade show d-block"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg mx-3 mx-sm-auto">
          {isLoading ? (
            <InfrastructureSkeleton />
          ) : (
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
                  background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-road me-2"></i>
                  {existingData ? 'Edit' : 'Add'} Infrastructure Status - {incident.title}
                  {existingData && <span className="badge bg-light text-dark ms-2">Editing Existing Data</span>}
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
                    maxHeight: '70vh', 
                    overflowY: 'auto',
                  }}
                >
                  <div className="row g-3">
                    
                    {/* Roads and Bridges Section */}
                    <div className="col-12">
                      <div className="card border-0 bg-white">
                        <div 
                          className="card-header border-bottom py-3 bg-white"
                          style={{ 
                            borderColor: 'rgba(255, 193, 7, 0.2)'
                          }}
                        >
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-road me-2 text-warning"></i>
                            Status of Roads and Bridges
                          </h6>
                        </div>
                        <div className="card-body p-3 bg-white">
                          <div className="row g-3">
                            <div className="col-12 col-md-6">
                              <label className="form-label fw-semibold text-dark">Status *</label>
                              <select 
                                name="roads_bridges_status"
                                value={form.roads_bridges_status}
                                onChange={handleInputChange}
                                className="form-select bg-white"
                                required
                                disabled={isSubmitting}
                              >
                                <option value="PASSABLE">PASSABLE</option>
                                <option value="NOT_PASSABLE">NOT PASSABLE</option>
                              </select>
                            </div>

                            {form.roads_bridges_status === 'NOT_PASSABLE' && (
                              <>
                                <div className="col-12 col-md-6">
                                  <label className="form-label fw-semibold text-dark">
                                    Date and Time Reported Not Passable *
                                  </label>
                                  <input
                                    type="datetime-local"
                                    name="roads_reported_not_passable"
                                    value={form.roads_reported_not_passable}
                                    onChange={handleInputChange}
                                    className={`form-control bg-white ${formErrors.roads_reported_not_passable ? 'is-invalid' : ''}`}
                                    max={getCurrentDateTime()}
                                    disabled={isSubmitting}
                                  />
                                  {formErrors.roads_reported_not_passable && (
                                    <div className="invalid-feedback">
                                      {formErrors.roads_reported_not_passable}
                                    </div>
                                  )}
                                </div>
                                <div className="col-12 col-md-6">
                                  <label className="form-label fw-semibold text-dark">
                                    Date and Time Reported Passable
                                  </label>
                                  <input
                                    type="datetime-local"
                                    name="roads_reported_passable"
                                    value={form.roads_reported_passable}
                                    onChange={handleInputChange}
                                    className="form-control bg-white"
                                    max={getCurrentDateTime()}
                                    disabled={isSubmitting}
                                  />
                                </div>
                              </>
                            )}
                            
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Remarks
                              </label>
                              <textarea
                                name="roads_remarks"
                                value={form.roads_remarks}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                rows="3"
                                placeholder="Additional details about road conditions, damage, or restoration efforts..."
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Power Supply Section */}
                    <div className="col-12 col-md-6">
                      <div className="card border-0 bg-white">
                        <div 
                          className="card-header border-bottom py-3 bg-white"
                          style={{ 
                            borderColor: 'rgba(255, 193, 7, 0.2)'
                          }}
                        >
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-bolt me-2 text-warning"></i>
                            Power Supply
                          </h6>
                        </div>
                        <div className="card-body p-3 bg-white">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Power Outage Time
                              </label>
                              <input
                                type="datetime-local"
                                name="power_outage_time"
                                value={form.power_outage_time}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                max={getCurrentDateTime()}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Power Restored Time
                              </label>
                              <input
                                type="datetime-local"
                                name="power_restored_time"
                                value={form.power_restored_time}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                max={getCurrentDateTime()}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Remarks
                              </label>
                              <textarea
                                name="power_remarks"
                                value={form.power_remarks}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                rows="2"
                                placeholder="Details about power outage and restoration..."
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication Lines Section */}
                    <div className="col-12 col-md-6">
                      <div className="card border-0 bg-white">
                        <div 
                          className="card-header border-bottom py-3 bg-white"
                          style={{ 
                            borderColor: 'rgba(255, 193, 7, 0.2)'
                          }}
                        >
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-signal me-2 text-info"></i>
                            Communication Lines
                          </h6>
                        </div>
                        <div className="card-body p-3 bg-white">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Communication Interruption Time
                              </label>
                              <input
                                type="datetime-local"
                                name="communication_interruption_time"
                                value={form.communication_interruption_time}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                max={getCurrentDateTime()}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Communication Restored Time
                              </label>
                              <input
                                type="datetime-local"
                                name="communication_restored_time"
                                value={form.communication_restored_time}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                max={getCurrentDateTime()}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Remarks
                              </label>
                              <textarea
                                name="communication_remarks"
                                value={form.communication_remarks}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                rows="2"
                                placeholder="Details about communication line status..."
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
                      backgroundColor: isSubmitting ? 'var(--bs-secondary)' : '#ffc107',
                      borderColor: isSubmitting ? 'var(--bs-secondary)' : '#ffc107',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      minWidth: '140px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.target.style.backgroundColor = '#e0a800';
                        e.target.style.borderColor = '#e0a800';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(224, 168, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.target.style.backgroundColor = '#ffc107';
                        e.target.style.borderColor = '#ffc107';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {existingData ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {existingData ? 'Update' : 'Save'} Infrastructure Status
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default InfrastructureStatusModal;