// components/dashboards/PendingApproval.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaClock, FaEnvelope, FaPhone, FaUser, FaInfoCircle } from 'react-icons/fa';

const PendingApproval = () => {
  const { user, logout } = useAuth();

  const handleContactSupport = () => {
    // You can implement contact functionality here
    alert('Please contact the municipal administrator for account approval.');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Account Pending Approval</h1>
              <p className="text-muted mb-0">
                Welcome, {user?.name} from {user?.barangay_name}
              </p>
            </div>
            <button 
              className="btn btn-outline-danger"
              onClick={handleLogout}
            >
              <FaUser className="me-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          {/* Status Card */}
          <div className="card border-warning mb-4">
            <div className="card-header bg-warning text-dark">
              <div className="d-flex align-items-center">
                <FaClock className="me-2" />
                <h5 className="mb-0">Awaiting Administrator Approval</h5>
              </div>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-2 text-center mb-3 mb-md-0">
                  <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                    style={{ width: '80px', height: '80px' }}>
                    <FaClock size={30} className="text-white" />
                  </div>
                </div>
                <div className="col-md-10">
                  <h5 className="text-warning">Your account is under review</h5>
                  <p className="mb-3">
                    Thank you for registering your barangay account. Your application is currently being reviewed 
                    by the municipal administrator. You will gain full access to the BRIMS system once your 
                    account is approved.
                  </p>
                  <div className="alert alert-info">
                    <FaInfoCircle className="me-2" />
                    <strong>Note:</strong> This process typically takes 1-2 business days.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Your Registration Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Full Name</label>
                    <p className="mb-0 fw-semibold">{user?.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Position</label>
                    <p className="mb-0 fw-semibold">{user?.position}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Email</label>
                    <div className="d-flex align-items-center">
                      <FaEnvelope className="text-muted me-2" size={14} />
                      <p className="mb-0 fw-semibold">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Barangay</label>
                    <p className="mb-0 fw-semibold">{user?.barangay_name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Municipality</label>
                    <p className="mb-0 fw-semibold">{user?.municipality}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Contact Number</label>
                    <div className="d-flex align-items-center">
                      <FaPhone className="text-muted me-2" size={14} />
                      <p className="mb-0 fw-semibold">{user?.contact}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">What happens next?</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" 
                    style={{ width: '60px', height: '60px' }}>
                    <span className="text-primary fw-bold">1</span>
                  </div>
                  <h6>Review Process</h6>
                  <p className="small text-muted">
                    Municipal administrator verifies your barangay details
                  </p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" 
                    style={{ width: '60px', height: '60px' }}>
                    <span className="text-primary fw-bold">2</span>
                  </div>
                  <h6>Approval</h6>
                  <p className="small text-muted">
                    Account is activated with appropriate permissions
                  </p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" 
                    style={{ width: '60px', height: '60px' }}>
                    <span className="text-primary fw-bold">3</span>
                  </div>
                  <h6>Full Access</h6>
                  <p className="small text-muted">
                    You can start using all BRIMS features for your barangay
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <button 
                  className="btn btn-primary me-3"
                  onClick={handleContactSupport}
                >
                  <FaEnvelope className="me-2" />
                  Contact Administrator
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Limited Access Notice */}
          <div className="alert alert-warning mt-4">
            <div className="d-flex">
              <FaInfoCircle className="me-3 mt-1 flex-shrink-0" />
              <div>
                <h6 className="alert-heading">Limited Access</h6>
                <p className="mb-0">
                  While waiting for approval, you have limited access to the system. 
                  Once approved, you'll be able to:
                </p>
                <ul className="mb-0 mt-2">
                  <li>Manage barangay population data</li>
                  <li>Report and monitor incidents</li>
                  <li>Track disaster-affected populations</li>
                  <li>Generate reports and analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;