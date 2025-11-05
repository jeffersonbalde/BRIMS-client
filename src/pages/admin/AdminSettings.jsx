// src/pages/admin/AdminSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { showAlert, showToast } from '../../services/notificationService';
import {
  FaKey,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaShieldAlt,
  FaCog
} from "react-icons/fa";

const AdminSettings = () => {
  const { user, token, refreshUserData } = useAuth();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.current_password) {
      errors.current_password = ['Current password is required.'];
    }

    if (!passwordForm.new_password) {
      errors.new_password = ['New password is required.'];
    } else if (passwordForm.new_password.length < 6) {
      errors.new_password = ['Password must be at least 6 characters long.'];
    }

    if (!passwordForm.new_password_confirmation) {
      errors.new_password_confirmation = ['Please confirm your new password.'];
    } else if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      errors.new_password_confirmation = ['Passwords do not match.'];
    }

    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showAlert.error('Validation Error', 'Please check the form for errors.');
      return;
    }

    const result = await showAlert.confirm(
      "Change Password",
      "Are you sure you want to change your password?",
      "Yes, Change Password",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    showAlert.loading("Changing Password...", "Please wait while we securely update your password", {
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
    });

    setIsPasswordLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
          confirm_password: passwordForm.new_password_confirmation
        })
      });

      const data = await response.json();
      showAlert.close();

      if (response.ok) {
        showToast.success('Password changed successfully!');
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        setFormErrors({});
        
        // Refresh user data
        await refreshUserData();
      } else {
        if (data.errors) {
          setFormErrors(data.errors);
          const errorMessages = Object.values(data.errors).flat().join('\n');
          showAlert.error('Password Change Failed', errorMessages);
        } else if (data.message) {
          if (data.message.includes('current password')) {
            setFormErrors({ current_password: ['Current password is incorrect.'] });
          }
          showAlert.error('Password Change Failed', data.message);
        } else {
          showAlert.error('Password Change Failed', 'An unknown error occurred.');
        }
      }
    } catch (error) {
      showAlert.close();
      showAlert.error('Network Error', 'Unable to connect to server. Please try again.');
      console.error('Password change error:', error);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="container-fluid px-1 px-md-1 py-4">
      {/* Header */}
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
          >
            <FaCog className="text-white" size={22} />
          </div>
          <div className="text-center text-md-start">
            <h1 className="h3 mb-1 fw-bold" style={{ color: "var(--text-primary)" }}>
              Administrator Settings
            </h1>
            <p className="text-muted mb-0">
              {user?.name} • System Administrator
            </p>
            <small className="text-muted">
              Password management only
            </small>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0  " style={{  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)", }}>
            <div className="card-header bg-transparent border-0 py-3 px-3 px-md-4">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-2 me-md-3 flex-shrink-0"
                  style={{
                    width: "32px",
                    height: "32px",
                    background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)',
                    color: 'white',
                  }}
                >
                  <FaShieldAlt style={{ fontSize: "0.875rem" }} />
                </div>
                <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
                  Change Password
                </h6>
              </div>
            </div>
            <div className="card-body p-3 p-md-4">
              <div className="alert alert-info mb-4 border-0" style={{
                backgroundColor: 'rgba(114, 170, 135, 0.1)',
                borderColor: 'var(--primary-light)',
                color: 'var(--text-primary)'
              }}>
                <strong>Administrator Note:</strong> As a system administrator, you can only change your password. 
                Personal information modifications are restricted for security reasons.
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="row g-3">
                  {/* Current Password */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Current Password *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0" style={{
                        borderColor: formErrors.current_password ? '#dc3545' : 'var(--input-border)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}>
                        <FaLock style={{ color: formErrors.current_password ? '#dc3545' : 'var(--text-muted)' }} />
                      </span>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="current_password"
                        className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.current_password ? 'is-invalid' : ''}`}
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--input-text)',
                          borderColor: formErrors.current_password ? '#dc3545' : 'var(--input-border)',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}
                        value={passwordForm.current_password}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter current password"
                        disabled={isPasswordLoading}
                        required
                      />
                      <span className="input-group-text bg-transparent border-start-0" style={{
                        borderColor: formErrors.current_password ? '#dc3545' : 'var(--input-border)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}>
                        <button
                          type="button"
                          className="btn btn-sm p-0 border-0 bg-transparent"
                          style={{ color: formErrors.current_password ? '#dc3545' : 'var(--text-muted)' }}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={isPasswordLoading}
                        >
                          {showCurrentPassword ? <FaEyeSlash style={{ fontSize: "0.875rem" }} /> : <FaEye style={{ fontSize: "0.875rem" }} />}
                        </button>
                      </span>
                    </div>
                    {formErrors.current_password && <div className="invalid-feedback d-block small mt-1">{formErrors.current_password[0]}</div>}
                  </div>

                  {/* New Password */}
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      New Password *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0" style={{
                        borderColor: formErrors.new_password ? '#dc3545' : 'var(--input-border)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}>
                        <FaLock style={{ color: formErrors.new_password ? '#dc3545' : 'var(--text-muted)' }} />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="new_password"
                        className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.new_password ? 'is-invalid' : ''}`}
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--input-text)',
                          borderColor: formErrors.new_password ? '#dc3545' : 'var(--input-border)',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}
                        value={passwordForm.new_password}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter new password"
                        disabled={isPasswordLoading}
                        required
                        minLength={6}
                      />
                      <span className="input-group-text bg-transparent border-start-0" style={{
                        borderColor: formErrors.new_password ? '#dc3545' : 'var(--input-border)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}>
                        <button
                          type="button"
                          className="btn btn-sm p-0 border-0 bg-transparent"
                          style={{ color: formErrors.new_password ? '#dc3545' : 'var(--text-muted)' }}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={isPasswordLoading}
                        >
                          {showNewPassword ? <FaEyeSlash style={{ fontSize: "0.875rem" }} /> : <FaEye style={{ fontSize: "0.875rem" }} />}
                        </button>
                      </span>
                    </div>
                    {formErrors.new_password && <div className="invalid-feedback d-block small mt-1">{formErrors.new_password[0]}</div>}
                    <div className="form-text small mt-1" style={{ color: 'var(--text-muted)' }}>Password must be at least 6 characters long</div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                      Confirm New Password *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0" style={{
                        borderColor: formErrors.new_password_confirmation ? '#dc3545' : 'var(--input-border)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}>
                        <FaLock style={{ color: formErrors.new_password_confirmation ? '#dc3545' : 'var(--text-muted)' }} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="new_password_confirmation"
                        className={`form-control border-start-0 ps-2 fw-semibold ${formErrors.new_password_confirmation ? 'is-invalid' : ''}`}
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--input-text)',
                          borderColor: formErrors.new_password_confirmation ? '#dc3545' : 'var(--input-border)',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}
                        value={passwordForm.new_password_confirmation}
                        onChange={handlePasswordInputChange}
                        placeholder="Confirm new password"
                        disabled={isPasswordLoading}
                        required
                        minLength={6}
                      />
                      <span className="input-group-text bg-transparent border-start-0" style={{
                        borderColor: formErrors.new_password_confirmation ? '#dc3545' : 'var(--input-border)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}>
                        <button
                          type="button"
                          className="btn btn-sm p-0 border-0 bg-transparent"
                          style={{ color: formErrors.new_password_confirmation ? '#dc3545' : 'var(--text-muted)' }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isPasswordLoading}
                        >
                          {showConfirmPassword ? <FaEyeSlash style={{ fontSize: "0.875rem" }} /> : <FaEye style={{ fontSize: "0.875rem" }} />}
                        </button>
                      </span>
                    </div>
                    {formErrors.new_password_confirmation && <div className="invalid-feedback d-block small mt-1">{formErrors.new_password_confirmation[0]}</div>}
                  </div>

                  {/* Submit Button */}
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn w-100 d-flex align-items-center justify-content-center py-2 border-0 position-relative overflow-hidden"
                      disabled={isPasswordLoading}
                      style={{
                        background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)",
                        color: "white",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(51, 107, 49, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isPasswordLoading) {
                          e.target.style.background = "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)";
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 4px 8px rgba(51, 107, 49, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPasswordLoading) {
                          e.target.style.background = "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)";
                          e.target.style.transform = "translateY(0px)";
                          e.target.style.boxShadow = "0 2px 4px rgba(51, 107, 49, 0.2)";
                        }
                      }}
                      onMouseDown={(e) => {
                        if (!isPasswordLoading) {
                          e.target.style.transform = "translateY(0px)";
                          e.target.style.boxShadow = "0 1px 2px rgba(51, 107, 49, 0.3)";
                        }
                      }}
                      onMouseUp={(e) => {
                        if (!isPasswordLoading) {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow = "0 4px 8px rgba(51, 107, 49, 0.3)";
                        }
                      }}
                    >
                      {isPasswordLoading ? (
                        <>
                          <FaSpinner className="spinner me-2 flex-shrink-0" style={{ fontSize: "0.75rem" }} />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <FaKey className="me-2 flex-shrink-0" style={{ fontSize: "0.75rem" }} />
                          Change Administrator Password
                          <FaArrowRight className="ms-2 flex-shrink-0" style={{ fontSize: "0.625rem" }} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Input field focus states */
        .form-control:focus {
          border-color: var(--primary-light) !important;
          box-shadow: 0 0 0 0.2rem rgba(114, 170, 135, 0.25) !important;
        }
        
        /* Invalid input states */
        .form-control.is-invalid {
          border-color: #dc3545 !important;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .input-group-text {
            padding: 0.5rem 0.75rem;
          }
          
          .btn {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;