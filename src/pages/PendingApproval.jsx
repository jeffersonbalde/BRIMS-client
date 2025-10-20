// components/dashboards/PendingApproval.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaClock, FaEnvelope, FaPhone, FaInfoCircle, FaUserCheck, FaListAlt, FaShieldAlt } from 'react-icons/fa';

const PendingApproval = () => {
  const { user } = useAuth();

  const handleContactSupport = () => {
    // You can implement contact functionality here
    alert('Please contact the municipal administrator for account approval.');
  };

  return (
    <div className="container-fluid px-3 px-md-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3" 
              style={{ width: '50px', height: '50px' }}>
              <FaClock size={20} className="text-white" />
            </div>
            <div>
              <h1 className="h2 mb-1" style={{ color: 'var(--text-primary)' }}>
                Account Pending Approval
              </h1>
              <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                Welcome, <strong>{user?.name}</strong> from {user?.barangay_name}, {user?.municipality}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-xxl-10 col-xl-12">
          {/* Status Alert Card */}
          <div className="card border-warning mb-4" style={{ borderWidth: '2px' }}>
            <div className="card-header bg-warning text-dark d-flex align-items-center py-3">
              <FaClock className="me-2" />
              <h5 className="mb-0 fw-semibold">Awaiting Administrator Approval</h5>
            </div>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h5 className="text-warning mb-3">Your account is under review</h5>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                    Thank you for registering your barangay account with the Barangay Real-time Incident Monitoring System (BRIMS). 
                    Your application is currently being reviewed by the municipal administrator to ensure all information is accurate 
                    and complete.
                  </p>
                  <div className="alert alert-info border-0" style={{ 
                    backgroundColor: 'rgba(13, 110, 253, 0.1)', 
                    color: 'var(--text-primary)',
                    borderLeft: '4px solid var(--primary-light)'
                  }}>
                    <FaInfoCircle className="me-2" style={{ color: 'var(--primary-light)' }} />
                    <strong>Note:</strong> This verification process typically takes 1-2 business days. You will receive an email notification once your account is approved.
                  </div>
                </div>
                <div className="col-lg-4 text-center">
                  <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                    style={{ width: '120px', height: '120px' }}>
                    <FaClock size={40} className="text-white" />
                  </div>
                  <button 
                    className="btn btn-primary mt-2"
                    onClick={handleContactSupport}
                    style={{
                      backgroundColor: 'var(--btn-primary-bg)',
                      borderColor: 'var(--btn-primary-bg)'
                    }}
                  >
                    <FaEnvelope className="me-2" />
                    Contact Administrator
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Account Information Card */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex align-items-center py-3">
                  <FaUserCheck className="me-2" style={{ color: 'var(--primary-light)' }} />
                  <h5 className="mb-0">Registration Details</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-3 pb-2 border-bottom">
                        <label className="form-label small text-muted mb-1">Full Name</label>
                        <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                      </div>
                      <div className="mb-3 pb-2 border-bottom">
                        <label className="form-label small text-muted mb-1">Position</label>
                        <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{user?.position}</p>
                      </div>
                      <div className="mb-3 pb-2 border-bottom">
                        <label className="form-label small text-muted mb-1">Email Address</label>
                        <div className="d-flex align-items-center">
                          <FaEnvelope className="text-muted me-2" size={14} />
                          <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
                        </div>
                      </div>
                      <div className="mb-3 pb-2 border-bottom">
                        <label className="form-label small text-muted mb-1">Barangay</label>
                        <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{user?.barangay_name}</p>
                      </div>
                      <div className="mb-3 pb-2 border-bottom">
                        <label className="form-label small text-muted mb-1">Municipality</label>
                        <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{user?.municipality}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small text-muted mb-1">Contact Number</label>
                        <div className="d-flex align-items-center">
                          <FaPhone className="text-muted me-2" size={14} />
                          <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>{user?.contact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex align-items-center py-3">
                  <FaListAlt className="me-2" style={{ color: 'var(--primary-light)' }} />
                  <h5 className="mb-0">Approval Process</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex align-items-start p-3 rounded" style={{ backgroundColor: 'var(--background-light)' }}>
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                          style={{ width: '40px', height: '40px' }}>
                          <span className="text-white fw-bold small">1</span>
                        </div>
                        <div>
                          <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>Document Verification</h6>
                          <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                            Municipal administrator reviews your barangay credentials and registration details
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-start p-3 rounded" style={{ backgroundColor: 'var(--background-light)' }}>
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                          style={{ width: '40px', height: '40px' }}>
                          <span className="text-white fw-bold small">2</span>
                        </div>
                        <div>
                          <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>Account Approval</h6>
                          <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                            Account is activated with appropriate permissions and access levels
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-start p-3 rounded" style={{ backgroundColor: 'var(--background-light)' }}>
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                          style={{ width: '40px', height: '40px' }}>
                          <span className="text-white fw-bold small">3</span>
                        </div>
                        <div>
                          <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>System Access</h6>
                          <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                            Full access granted to BRIMS features for real-time incident monitoring and reporting
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="card border-0 mb-4" style={{ 
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
            color: 'white'
          }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h4 className="mb-3">What to expect after approval?</h4>
                  <p className="mb-0 opacity-90">
                    Once your account is approved, you'll have full access to the BRIMS platform including 
                    real-time incident reporting, population data management, disaster monitoring, and 
                    comprehensive analytics for your barangay.
                  </p>
                </div>
                <div className="col-lg-4 text-center">
                  <FaShieldAlt size={60} className="opacity-75" />
                </div>
              </div>
            </div>
          </div>

          {/* Limited Access Notice */}
          <div className="alert alert-warning border-0 mb-0">
            <div className="d-flex align-items-start">
              <FaInfoCircle className="me-3 mt-1 flex-shrink-0" size={18} />
              <div>
                <h6 className="alert-heading mb-2">Current Access Limitations</h6>
                <p className="mb-3">
                  While your account is pending approval, you have limited access to the system. 
                  Once approved, you'll be able to:
                </p>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="mb-2">
                      <li>Manage barangay population data</li>
                      <li>Report and track incidents in real-time</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="mb-0">
                      <li>Monitor disaster-affected populations</li>
                      <li>Generate comprehensive reports and analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;