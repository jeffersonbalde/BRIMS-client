// pages/Settings.jsx - UPDATED with Avatar Upload
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showAlert, showToast } from '../services/notificationService';
import {
  FaUser,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaShieldAlt,
  FaCalendarAlt,
  FaSave,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCamera,
  FaTimes
} from 'react-icons/fa';

const Settings = () => {
  const { user, token, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact: user?.contact || '',
    position: user?.position || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Theme from Register.jsx
  const theme = {
    primary: "#2d5a27",
    primaryDark: "#1f451c",
    primaryLight: "#3a6f32",
    accent: "#4a7c40",
    accentLight: "#5a8c50",
    textPrimary: "#1a2a1a",
    textSecondary: "#4a5c4a",
    inputBg: "#f8faf8",
    inputText: "#1a2a1a",
    inputBorder: "#c8d0c8",
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showAlert.error('Invalid File', 'Please select a valid image file (JPEG, PNG, GIF, or WebP).');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showAlert.error('File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    await uploadAvatar(file);
  };

  // Upload avatar to server
  const uploadAvatar = async (file) => {
    setIsAvatarLoading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Avatar updated successfully!');
        
        // Update the user context by refreshing user data
        if (refreshUserData) {
          await refreshUserData();
        }
      } else {
        if (data.errors) {
          showAlert.error('Upload Failed', data.errors.avatar ? data.errors.avatar[0] : 'Failed to upload avatar');
        } else {
          showAlert.error('Upload Failed', data.message || 'Failed to upload avatar');
        }
        // Reset preview on error
        setAvatarPreview(user?.avatar || null);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showAlert.error('Network Error', 'Unable to connect to server. Please try again.');
      // Reset preview on error
      setAvatarPreview(user?.avatar || null);
    } finally {
      setIsAvatarLoading(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    const result = await showAlert.confirm(
      "Remove Avatar",
      "Are you sure you want to remove your profile picture?",
      "Yes, Remove",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    setIsAvatarLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/profile/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Avatar removed successfully!');
        setAvatarPreview(null);
        
        // Update the user context by refreshing user data
        if (refreshUserData) {
          await refreshUserData();
        }
      } else {
        showAlert.error('Remove Failed', data.message || 'Failed to remove avatar');
      }
    } catch (error) {
      console.error('Avatar remove error:', error);
      showAlert.error('Network Error', 'Unable to connect to server. Please try again.');
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleContactSupport = () => {
    const phoneNumber = "+639123456789";
    const email = "admin@municipality.gov.ph";
    
    showAlert.info(
      "Contact Support",
      `<div style="text-align: left;">
        <p><strong>Municipal Administrator Contact Details:</strong></p>
        <p>📞 Phone: <strong>${phoneNumber}</strong></p>
        <p>📧 Email: <strong>${email}</strong></p>
        <p><br>Office Hours: <strong>8:00 AM - 5:00 PM (Monday-Friday)</strong></p>
      </div>`,
      "Got it"
    );
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'Municipal Administrator';
      case 'barangay':
        return 'Barangay Official';
      default:
        return role;
    }
  };

  // Handle contact number input - numbers only and max 11 digits
  const handleContactInput = (e) => {
    const { name, value } = e.target;
    
    // Remove any non-digit characters
    const numbersOnly = value.replace(/\D/g, '');
    
    // Limit to 11 characters
    const limitedValue = numbersOnly.slice(0, 11);
    
    setAccountForm(prev => ({
      ...prev,
      [name]: limitedValue
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle account form input changes
  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for contact field
    if (name === 'contact') {
      handleContactInput(e);
      return;
    }
    
    setAccountForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle password form input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate contact number before submission
  const validateContactNumber = (contact) => {
    if (!contact) {
      return 'Contact number is required';
    }
    
    if (contact.length !== 11) {
      return 'Contact number must be exactly 11 digits';
    }
    
    if (!contact.startsWith('09')) {
      return 'Contact number must start with 09';
    }
    
    return null;
  };

  // Format contact number for display (XXX-XXX-XXXX)
  const formatContact = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(
      6,
      11
    )}`;
  };

  // Update account information with confirmation and loading modal
  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    
    // Check if there are any changes
    const hasChanges = 
      accountForm.name !== user?.name ||
      accountForm.email !== user?.email ||
      accountForm.contact !== user?.contact ||
      accountForm.position !== user?.position;

    if (!hasChanges) {
      showToast.info('No changes detected to update.');
      return;
    }

    // Validate contact number
    const contactError = validateContactNumber(accountForm.contact);
    if (contactError) {
      setFormErrors(prev => ({ ...prev, contact: [contactError] }));
      showAlert.error('Validation Error', contactError);
      return;
    }

    // Show confirmation dialog
    const result = await showAlert.confirm(
      "Update Account Information",
      "Are you sure you want to update your account information?",
      "Yes, Update",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    // Show loading modal that blocks interaction
    showAlert.loading("Updating Profile...", "Please wait while we update your account information", {
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      didOpen: () => {
        // Disable form inputs during processing
        const form = e.target;
        const inputs = form.querySelectorAll('input, button, textarea, select');
        inputs.forEach(input => {
          input.setAttribute('disabled', 'true');
          input.style.opacity = '0.6';
          input.style.cursor = 'not-allowed';
        });
      }
    });

    setIsAccountLoading(true);
    setFormErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(accountForm)
      });

      const data = await response.json();

      // Close loading modal
      showAlert.close();

      if (response.ok) {
        showToast.success('Account information updated successfully!');
        
        // Update the user context by refreshing user data
        if (refreshUserData) {
          await refreshUserData();
        }
        
      } else {
        if (data.errors) {
          setFormErrors(data.errors);
          showAlert.error('Update Failed', 'Please check the form for errors.');
        } else {
          showAlert.error('Update Failed', data.message || 'Failed to update account information');
        }
      }
    } catch (error) {
      // Close loading modal in case of error
      showAlert.close();
      console.error('Account update error:', error);
      showAlert.error('Network Error', 'Unable to connect to server. Please try again.');
    } finally {
      setIsAccountLoading(false);
      // Re-enable form inputs
      const form = e.target;
      const inputs = form.querySelectorAll('input, button, textarea, select');
      inputs.forEach(input => {
        input.removeAttribute('disabled');
        input.style.opacity = '1';
        input.style.cursor = '';
      });
    }
  };

  // Change password with confirmation and loading modal
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Show confirmation dialog
    const result = await showAlert.confirm(
      "Change Password",
      "Are you sure you want to change your password?",
      "Yes, Change Password",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    // Show loading modal that blocks interaction
    showAlert.loading("Changing Password...", "Please wait while we securely update your password", {
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      didOpen: () => {
        // Disable form inputs during processing
        const form = e.target;
        const inputs = form.querySelectorAll('input, button, textarea, select');
        inputs.forEach(input => {
          input.setAttribute('disabled', 'true');
          input.style.opacity = '0.6';
          input.style.cursor = 'not-allowed';
        });
      }
    });

    setIsPasswordLoading(true);
    setFormErrors({});

    // Client-side validation
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showAlert.close();
      setFormErrors({ confirm_password: ['Passwords do not match.'] });
      setIsPasswordLoading(false);
      showAlert.error('Validation Error', 'Passwords do not match.');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      showAlert.close();
      setFormErrors({ new_password: ['Password must be at least 8 characters long.'] });
      setIsPasswordLoading(false);
      showAlert.error('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(passwordForm)
      });

      const data = await response.json();

      // Close loading modal
      showAlert.close();

      if (response.ok) {
        showToast.success('Password changed successfully!');
        // Reset password form
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        if (data.errors) {
          setFormErrors(data.errors);
          showAlert.error('Password Change Failed', 'Please check the form for errors.');
        } else {
          showAlert.error('Password Change Failed', data.message || 'Failed to change password');
        }
      }
    } catch (error) {
      // Close loading modal in case of error
      showAlert.close();
      console.error('Password change error:', error);
      showAlert.error('Network Error', 'Unable to connect to server. Please try again.');
    } finally {
      setIsPasswordLoading(false);
      // Re-enable form inputs
      const form = e.target;
      const inputs = form.querySelectorAll('input, button, textarea, select');
      inputs.forEach(input => {
        input.removeAttribute('disabled');
        input.style.opacity = '1';
        input.style.cursor = '';
      });
    }
  };

  // Clear errors when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormErrors({});
  };

  return (
    <div className="container-fluid px-1 py-3">
{/* Header with Light Background - Matching Profile.jsx */}
<div className="text-center mb-4">
  <div className="d-flex justify-content-center align-items-center mb-3">
    {/* Avatar Section */}
    <div className="position-relative me-3">
      <div
        className="rounded-circle border d-flex align-items-center justify-content-center position-relative"
        style={{
          width: "80px",
          height: "80px",
          background: avatarPreview 
            ? "transparent"
            : user?.role === 'admin' 
              ? "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)"
              : "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
          border: user?.role === 'admin' 
            ? "3px solid #8B4513 !important" 
            : "3px solid var(--primary-light) !important",
          color: "white",
          overflow: "hidden",
        }}
      >
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center">
            {user?.role === 'admin' ? (
              <FaShieldAlt size={32} />
            ) : (
              <FaUser size={32} />
            )}
          </div>
        )}
      </div>

      {/* Avatar Upload Button - FIXED: Made circular and properly styled */}
      <div className="position-absolute bottom-0 end-0 d-flex gap-1">
        <label
          htmlFor="avatar-upload"
          className="btn p-1 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "28px",
            height: "28px",
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
            color: "white",
            border: "2px solid white",
            cursor: isAvatarLoading ? 'not-allowed' : 'pointer',
            opacity: isAvatarLoading ? 0.6 : 1,
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!isAvatarLoading) {
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isAvatarLoading) {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
            }
          }}
          title="Change avatar"
        >
          {isAvatarLoading ? (
            <FaSpinner className="spinner" size={12} />
          ) : (
            <FaCamera size={12} />
          )}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          disabled={isAvatarLoading}
          style={{ display: 'none' }}
        />

        {/* Remove Avatar Button - FIXED: Made circular and properly styled */}
        {avatarPreview && (
          <button
            className="btn p-1 rounded-circle d-flex align-items-center justify-content-center"
            onClick={handleRemoveAvatar}
            disabled={isAvatarLoading}
            style={{
              width: "28px",
              height: "28px",
              background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
              color: "white",
              border: "2px solid white",
              cursor: isAvatarLoading ? 'not-allowed' : 'pointer',
              opacity: isAvatarLoading ? 0.6 : 1,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!isAvatarLoading) {
                e.target.style.transform = "scale(1.1)";
                e.target.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isAvatarLoading) {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
              }
            }}
            title="Remove avatar"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>
    </div>

    <div className="text-start">
      <h1
        className="h3 mb-1 fw-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Account Settings
      </h1>
      <p className="text-muted mb-0 small">
        {user?.name} • {getRoleDisplay(user?.role)}
      </p>
      <small className="text-muted">
        Click the camera icon to update your profile picture
      </small>
    </div>
  </div>
</div>

      <div className="row g-3">
        {/* Sidebar Navigation */}
        <div className="col-12 col-lg-3">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              background: "linear-gradient(135deg, var(--background-white) 0%, #f8fdf8 100%)",
              borderRadius: "12px",
              border: "1px solid rgba(45, 90, 39, 0.1)",
            }}
          >
            <div
              className="card-header bg-transparent border-0 py-3 px-3"
              style={{
                background: "linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)",
                borderBottom: "2px solid rgba(45, 90, 39, 0.3)",
              }}
            >
              <h6
                className="mb-0 fw-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Settings Menu
              </h6>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-2">
                {/* Account Settings Tab */}
                <button
                  className={`btn text-start p-3 d-flex align-items-center position-relative ${
                    activeTab === 'account' ? 'active' : ''
                  }`}
                  onClick={() => handleTabChange('account')}
                  style={{
                    background: activeTab === 'account' 
                      ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)',
                    border: activeTab === 'account'
                      ? '1px solid var(--primary-color)'
                      : '1px solid rgba(45, 90, 39, 0.2)',
                    borderRadius: "8px",
                    color: activeTab === 'account' ? 'white' : 'var(--text-primary)',
                    fontWeight: activeTab === 'account' ? '600' : '500',
                    transition: 'all 0.3s ease',
                    boxShadow: activeTab === 'account'
                      ? '0 4px 12px rgba(45, 90, 39, 0.25)'
                      : '0 2px 6px rgba(45, 90, 39, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'account') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)';
                      e.currentTarget.style.border = '1px solid rgba(45, 90, 39, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 90, 39, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'account') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)';
                      e.currentTarget.style.border = '1px solid rgba(45, 90, 39, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 90, 39, 0.1)';
                    }
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: activeTab === 'account'
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
                      color: activeTab === 'account' ? 'white' : 'white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <FaUser size={16} />
                  </div>
                  <div className="text-start">
                    <div 
                      className="fw-semibold"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Account Settings
                    </div>
                    <small 
                      style={{ 
                        opacity: activeTab === 'account' ? 0.9 : 0.7,
                        fontSize: '0.75rem'
                      }}
                    >
                      Update personal information
                    </small>
                  </div>
                </button>

                {/* Change Password Tab */}
                <button
                  className={`btn text-start p-3 d-flex align-items-center position-relative ${
                    activeTab === 'password' ? 'active' : ''
                  }`}
                  onClick={() => handleTabChange('password')}
                  style={{
                    background: activeTab === 'password' 
                      ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)',
                    border: activeTab === 'password'
                      ? '1px solid var(--primary-color)'
                      : '1px solid rgba(45, 90, 39, 0.2)',
                    borderRadius: "8px",
                    color: activeTab === 'password' ? 'white' : 'var(--text-primary)',
                    fontWeight: activeTab === 'password' ? '600' : '500',
                    transition: 'all 0.3s ease',
                    boxShadow: activeTab === 'password'
                      ? '0 4px 12px rgba(45, 90, 39, 0.25)'
                      : '0 2px 6px rgba(45, 90, 39, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'password') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)';
                      e.currentTarget.style.border = '1px solid rgba(45, 90, 39, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 90, 39, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'password') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 248, 0.9) 100%)';
                      e.currentTarget.style.border = '1px solid rgba(45, 90, 39, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(45, 90, 39, 0.1)';
                    }
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: activeTab === 'password'
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-light) 100%)',
                      color: activeTab === 'password' ? 'white' : 'white',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <FaLock size={16} />
                  </div>
                  <div className="text-start">
                    <div 
                      className="fw-semibold"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Change Password
                    </div>
                    <small 
                      style={{ 
                        opacity: activeTab === 'password' ? 0.9 : 0.7,
                        fontSize: '0.75rem'
                      }}
                    >
                      Update your password
                    </small>
                  </div>
                </button>
              </div>

              {/* Quick Help Section */}
              <div className="mt-4 pt-3 border-top border-light">
                <div className="text-center">
                  <small className="text-muted d-block mb-2">Need immediate help?</small>
                  <button
                    className="btn btn-sm w-100 d-flex align-items-center justify-content-center"
                    onClick={handleContactSupport}
                    style={{
                      background: 'linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)',
                      color: 'var(--primary-color)',
                      border: '1px solid rgba(45, 90, 39, 0.2)',
                      borderRadius: "6px",
                      fontWeight: "500",
                      fontSize: "0.8rem",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)';
                      e.currentTarget.style.border = '1px solid rgba(45, 90, 39, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(45, 90, 39, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 90, 39, 0.1) 0%, rgba(51, 108, 53, 0.1) 100%)';
                      e.currentTarget.style.border = '1px solid rgba(45, 90, 39, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <FaEnvelope className="me-2" size={10} />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-12 col-lg-9">
          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: "linear-gradient(135deg, var(--background-white) 0%, #f8fdf8 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(45, 90, 39, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                className="card-header bg-transparent border-0 py-3 px-3"
                style={{
                  background: "linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)",
                  borderBottom: "2px solid rgba(45, 90, 39, 0.3)",
                }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                      color: "white",
                    }}
                  >
                    <FaUser size={14} />
                  </div>
                  <h6
                    className="mb-0 fw-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Account Information
                  </h6>
                </div>
              </div>
              <div className="card-body p-3">
                <form onSubmit={handleAccountUpdate}>
                  <div className="row g-3">
                    {/* Full Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Full Name *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaUser className="text-muted" size={16} />
                        </span>
                        <input
                          type="text"
                          name="name"
                          className={`form-control border-start-0 ps-2 fw-semibold ${
                            formErrors.name ? 'is-invalid' : ''
                          }`}
                          value={accountForm.name}
                          onChange={handleAccountInputChange}
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: formErrors.name ? '#dc3545' : theme.inputBorder,
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = "0 0 0 0.2rem rgba(45, 90, 39, 0.25)";
                            e.target.style.borderColor = theme.primary;
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            e.target.style.borderColor = formErrors.name ? '#dc3545' : theme.inputBorder;
                          }}
                          required
                        />
                      </div>
                      {formErrors.name && (
                        <div className="invalid-feedback d-block small mt-1">
                          {formErrors.name[0]}
                        </div>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Email Address *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaEnvelope className="text-muted" size={16} />
                        </span>
                        <input
                          type="email"
                          name="email"
                          className={`form-control border-start-0 ps-2 fw-semibold ${
                            formErrors.email ? 'is-invalid' : ''
                          }`}
                          value={accountForm.email}
                          onChange={handleAccountInputChange}
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: formErrors.email ? '#dc3545' : theme.inputBorder,
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = "0 0 0 0.2rem rgba(45, 90, 39, 0.25)";
                            e.target.style.borderColor = theme.primary;
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            e.target.style.borderColor = formErrors.email ? '#dc3545' : theme.inputBorder;
                          }}
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <div className="invalid-feedback d-block small mt-1">
                          {formErrors.email[0]}
                        </div>
                      )}
                    </div>

                    {/* Contact Number - FIXED: Added validation and formatting */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Contact Number *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaPhone className="text-muted" size={16} />
                        </span>
                        <input
                          type="text"
                          name="contact"
                          className={`form-control border-start-0 ps-2 fw-semibold ${
                            formErrors.contact ? 'is-invalid' : ''
                          }`}
                          value={formatContact(accountForm.contact)}
                          onChange={handleAccountInputChange}
                          onKeyPress={(e) => {
                            // Prevent any non-digit characters
                            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                              e.preventDefault();
                            }
                          }}
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: formErrors.contact ? '#dc3545' : theme.inputBorder,
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = "0 0 0 0.2rem rgba(45, 90, 39, 0.25)";
                            e.target.style.borderColor = theme.primary;
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            e.target.style.borderColor = formErrors.contact ? '#dc3545' : theme.inputBorder;
                          }}
                          required
                          maxLength={13} // 11 digits + 2 dashes
                        />
                      </div>
                      {formErrors.contact && (
                        <div className="invalid-feedback d-block small mt-1">
                          {formErrors.contact[0]}
                        </div>
                      )}
                      <div className="form-text small mt-1">
                        Format: 09XX-XXX-XXXX (11 digits total)
                      </div>
                    </div>

                    {/* Position */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Position *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaIdCard className="text-muted" size={16} />
                        </span>
                        <input
                          type="text"
                          name="position"
                          className={`form-control border-start-0 ps-2 fw-semibold ${
                            formErrors.position ? 'is-invalid' : ''
                          }`}
                          value={accountForm.position}
                          onChange={handleAccountInputChange}
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: formErrors.position ? '#dc3545' : theme.inputBorder,
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = "0 0 0 0.2rem rgba(45, 90, 39, 0.25)";
                            e.target.style.borderColor = theme.primary;
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            e.target.style.borderColor = formErrors.position ? '#dc3545' : theme.inputBorder;
                          }}
                          required
                        />
                      </div>
                      {formErrors.position && (
                        <div className="invalid-feedback d-block small mt-1">
                          {formErrors.position[0]}
                        </div>
                      )}
                    </div>

                    {/* Submit Button - FIXED: Uses correct loading state */}
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn w-100 d-flex align-items-center justify-content-center py-2 position-relative overflow-hidden"
                        disabled={isAccountLoading}
                        style={{
                          background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(45, 90, 39, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isAccountLoading) {
                            e.currentTarget.style.background = "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 90, 39, 0.3)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isAccountLoading) {
                            e.currentTarget.style.background = "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(45, 90, 39, 0.2)";
                          }
                        }}
                      >
                        {isAccountLoading ? (
                          <>
                            <FaSpinner className="spinner me-2" size={12} />
                            Updating Account...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" size={12} />
                            Update Account Information
                            <FaArrowRight className="ms-2" size={10} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: "linear-gradient(135deg, var(--background-white) 0%, #f8fdf8 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(45, 90, 39, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                className="card-header bg-transparent border-0 py-3 px-3"
                style={{
                  background: "linear-gradient(135deg, rgba(45, 90, 39, 0.15) 0%, rgba(51, 108, 53, 0.15) 100%)",
                  borderBottom: "2px solid rgba(45, 90, 39, 0.3)",
                }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "linear-gradient(135deg, var(--accent-color) 0%, var(--accent-light) 100%)",
                      color: "white",
                    }}
                  >
                    <FaLock size={14} />
                  </div>
                  <h6
                    className="mb-0 fw-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Change Password
                  </h6>
                </div>
              </div>
              <div className="card-body p-3">
                <form onSubmit={handlePasswordChange}>
                  <div className="row g-3">
                    {/* Current Password */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Current Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaLock className="text-muted" size={16} />
                        </span>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="current_password"
                          className={`form-control border-start-0 ps-2 fw-semibold ${
                            formErrors.current_password ? 'is-invalid' : ''
                          }`}
                          value={passwordForm.current_password}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter current password"
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: formErrors.current_password ? '#dc3545' : theme.inputBorder,
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = "0 0 0 0.2rem rgba(45, 90, 39, 0.25)";
                            e.target.style.borderColor = theme.primary;
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            e.target.style.borderColor = formErrors.current_password ? '#dc3545' : theme.inputBorder;
                          }}
                          required
                        />
                        <span className="input-group-text bg-transparent border-start-0">
                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            style={{
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = theme.primary;
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            {showCurrentPassword ? (
                              <FaEyeSlash size={14} />
                            ) : (
                              <FaEye size={14} />
                            )}
                          </button>
                        </span>
                      </div>
                      {formErrors.current_password && (
                        <div className="invalid-feedback d-block small mt-1">
                          {formErrors.current_password[0]}
                        </div>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        New Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaLock className="text-muted" size={16} />
                        </span>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="new_password"
                          className={`form-control border-start-0 ps-2 fw-semibold ${
                            formErrors.new_password ? 'is-invalid' : ''
                          }`}
                          value={passwordForm.new_password}
                          onChange={handlePasswordInputChange}
                          placeholder="Enter new password"
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: formErrors.new_password ? '#dc3545' : theme.inputBorder,
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = "0 0 0 0.2rem rgba(45, 90, 39, 0.25)";
                            e.target.style.borderColor = theme.primary;
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            e.target.style.borderColor = formErrors.new_password ? '#dc3545' : theme.inputBorder;
                          }}
                          required
                          minLength={8}
                        />
                        <span className="input-group-text bg-transparent border-start-0">
                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = theme.primary;
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            {showNewPassword ? (
                              <FaEyeSlash size={14} />
                            ) : (
                              <FaEye size={14} />
                            )}
                          </button>
                        </span>
                      </div>
                      {formErrors.new_password && (
                        <div className="invalid-feedback d-block small mt-1">
                          {formErrors.new_password[0]}
                        </div>
                      )}
                      <div className="form-text small mt-1">
                        Password must be at least 8 characters long
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                        Confirm New Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0">
                          <FaLock className="text-muted" size={16} />
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          className={`form-control border-start-0 ps-2 fw-semibold ${
                            formErrors.confirm_password ? 'is-invalid' : ''
                          }`}
                          value={passwordForm.confirm_password}
                          onChange={handlePasswordInputChange}
                          placeholder="Confirm new password"
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.inputText,
                            borderColor: formErrors.confirm_password ? '#dc3545' : theme.inputBorder,
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = "0 0 0 0.2rem rgba(45, 90, 39, 0.25)";
                            e.target.style.borderColor = theme.primary;
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            e.target.style.borderColor = formErrors.confirm_password ? '#dc3545' : theme.inputBorder;
                          }}
                          required
                          minLength={8}
                        />
                        <span className="input-group-text bg-transparent border-start-0">
                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = theme.primary;
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash size={14} />
                            ) : (
                              <FaEye size={14} />
                            )}
                          </button>
                        </span>
                      </div>
                      {formErrors.confirm_password && (
                        <div className="invalid-feedback d-block small mt-1">
                          {formErrors.confirm_password[0]}
                        </div>
                      )}
                    </div>

                    {/* Submit Button - FIXED: Uses correct loading state */}
                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn w-100 d-flex align-items-center justify-content-center py-2 position-relative overflow-hidden"
                        disabled={isPasswordLoading}
                        style={{
                          background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(45, 90, 39, 0.2)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isPasswordLoading) {
                            e.currentTarget.style.background = "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(45, 90, 39, 0.3)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isPasswordLoading) {
                            e.currentTarget.style.background = "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(45, 90, 39, 0.2)";
                          }
                        }}
                      >
                        {isPasswordLoading ? (
                          <>
                            <FaSpinner className="spinner me-2" size={12} />
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <FaKey className="me-2" size={12} />
                            Change Password
                            <FaArrowRight className="ms-2" size={10} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx>{`
        .input-group-text {
          border-color: ${theme.inputBorder} !important;
          background-color: ${theme.inputBg} !important;
          transition: all 0.3s ease;
        }

        .input-group .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(45, 90, 39, 0.25) !important;
          border-color: ${theme.primary} !important;
        }

        .input-group .form-control {
          transition: all 0.3s ease;
        }

        .input-group .form-control:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Enhanced hover effects for all interactive elements */
        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(45, 90, 39, 0.15) !important;
        }

        .input-group:hover .input-group-text {
          background-color: rgba(45, 90, 39, 0.05) !important;
          border-color: rgba(45, 90, 39, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default Settings;