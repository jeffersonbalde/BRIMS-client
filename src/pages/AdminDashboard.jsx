// components/dashboards/AdminDashboard.jsx - FIXED VERSION
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="container-fluid px-4"> {/* ADD THIS CONTAINER */}
      <h1 className="mb-4">Municipal Administration Dashboard</h1>
      
      {/* Municipal Overview Cards */}
      <div className="row">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Total Barangays</h6>
                  <h3>18</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-map-marker-alt fa-2x"></i>
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
                  <h6>Pending Approvals</h6>
                  <h3>5</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-user-clock fa-2x"></i>
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
                  <h3>12</h3>
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
                  <h6>Total Population</h6>
                  <h3>45,678</h3>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary">
                  <i className="fas fa-user-check me-2"></i>
                  Review Approvals
                </button>
                <button className="btn btn-success">
                  <i className="fas fa-chart-bar me-2"></i>
                  View Municipal Report
                </button>
                <button className="btn btn-info">
                  <i className="fas fa-map me-2"></i>
                  Barangay Overview
                </button>
                <button className="btn btn-warning">
                  <i className="fas fa-cog me-2"></i>
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barangay Status Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Barangay Status Overview</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Barangay</th>
                      <th>Population</th>
                      <th>Active Incidents</th>
                      <th>Last Report</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>POBLACION</td>
                      <td>8,542</td>
                      <td>3</td>
                      <td>2 hours ago</td>
                      <td><span className="badge bg-success">Active</span></td>
                    </tr>
                    {/* Add other barangays */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;