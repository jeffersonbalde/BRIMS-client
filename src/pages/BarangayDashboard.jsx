// components/dashboards/BarangayDashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const BarangayDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-4">{user?.barangay_name} Barangay Dashboard</h1>
      
      {/* Barangay Overview Cards */}
      <div className="row">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Total Population</h6>
                  <h3>2,456</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card bg-success text-white mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Senior Citizens</h6>
                  <h3>187</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-wheelchair fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card bg-warning text-white mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Active Incidents</h6>
                  <h3>3</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-exclamation-triangle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card bg-info text-white mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>PWD Residents</h6>
                  <h3>45</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-accessibility fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Barangay */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary">
                  <i className="fas fa-user-plus me-2"></i>
                  Add Resident
                </button>
                <button className="btn btn-success">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Report Incident
                </button>
                <button className="btn btn-info">
                  <i className="fas fa-chart-bar me-2"></i>
                  Population Report
                </button>
                <button className="btn btn-warning">
                  <i className="fas fa-hands-helping me-2"></i>
                  Assistance Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Population Updates */}
      <div className="row">
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-users me-1"></i>
              Population Overview
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <h5>1,202</h5>
                  <small className="text-muted">Male</small>
                </div>
                <div className="col-4">
                  <h5>1,254</h5>
                  <small className="text-muted">Female</small>
                </div>
                <div className="col-4">
                  <h5>23</h5>
                  <small className="text-muted">LGBTQIA+</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-list me-1"></i>
              Recent Incidents
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Minor Flooding</h6>
                    <small className="text-muted">Zone 2 • 3 hours ago</small>
                  </div>
                  <span className="badge bg-warning">Ongoing</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Medical Emergency</h6>
                    <small className="text-muted">Health Center • 5 hours ago</small>
                  </div>
                  <span className="badge bg-success">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarangayDashboard;