// pages/barangay/BarangayAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";

const BarangayAnalytics = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/analytics/barangay`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch analytics");
        }
      } else {
        throw new Error("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error.message);
      // Set default empty analytics structure
      setAnalytics({
        total_incidents: 0,
        resolved_incidents: 0,
        active_incidents: 0,
        pending_incidents: 0,
        incidents_by_type: [],
        incidents_by_severity: [],
        monthly_trends: [],
        population_stats: {
          total_affected: 0,
          total_displaced_families: 0,
          total_displaced_persons: 0,
          total_families_assisted: 0,
          total_families_requiring_assistance: 0,
          assistance_coverage: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Safe data access
  const safeAnalytics = analytics || {
    total_incidents: 0,
    resolved_incidents: 0,
    active_incidents: 0,
    pending_incidents: 0,
    incidents_by_type: [],
    incidents_by_severity: [],
    monthly_trends: [],
    population_stats: {
      total_affected: 0,
      total_displaced_families: 0,
      total_displaced_persons: 0,
      total_families_assisted: 0,
      total_families_requiring_assistance: 0,
      assistance_coverage: 0,
    },
  };

  if (loading) {
    return (
      <div className="container-fluid px-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-dark">Barangay Analytics</h1>
        <div className="badge bg-primary">
          <i className="fas fa-chart-bar me-1"></i>
          {user?.barangay_name}
        </div>
      </div>

      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          <strong>Warning:</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-xs fw-semibold text-uppercase mb-1">
                    Total Incidents
                  </div>
                  <div className="h5 mb-0">{safeAnalytics.total_incidents}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-exclamation-triangle fa-2x"></i>
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
                  <div className="text-xs fw-semibold text-uppercase mb-1">
                    Resolved
                  </div>
                  <div className="h5 mb-0">
                    {safeAnalytics.resolved_incidents}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x"></i>
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
                  <div className="text-xs fw-semibold text-uppercase mb-1">
                    Active
                  </div>
                  <div className="h5 mb-0">
                    {safeAnalytics.active_incidents}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x"></i>
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
                  <div className="text-xs fw-semibold text-uppercase mb-1">
                    Response Rate
                  </div>
                  <div className="h5 mb-0">
                    {safeAnalytics.total_incidents > 0
                      ? Math.round(
                          (safeAnalytics.resolved_incidents /
                            safeAnalytics.total_incidents) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Population Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-2 col-md-4">
          <div className="card bg-light mb-4">
            <div className="card-body text-center">
              <div className="text-xs fw-semibold text-uppercase mb-1 text-muted">
                Total Affected
              </div>
              <div className="h5 mb-0 text-primary">
                {safeAnalytics.population_stats.total_affected}
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-md-4">
          <div className="card bg-light mb-4">
            <div className="card-body text-center">
              <div className="text-xs fw-semibold text-uppercase mb-1 text-muted">
                Displaced Families
              </div>
              <div className="h5 mb-0 text-warning">
                {safeAnalytics.population_stats.total_displaced_families}
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-md-4">
          <div className="card bg-light mb-4">
            <div className="card-body text-center">
              <div className="text-xs fw-semibold text-uppercase mb-1 text-muted">
                Displaced Persons
              </div>
              <div className="h5 mb-0 text-danger">
                {safeAnalytics.population_stats.total_displaced_persons}
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-light mb-4">
            <div className="card-body text-center">
              <div className="text-xs fw-semibold text-uppercase mb-1 text-muted">
                Families Assisted
              </div>
              <div className="h5 mb-0 text-success">
                {safeAnalytics.population_stats.total_families_assisted} /{" "}
                {
                  safeAnalytics.population_stats
                    .total_families_requiring_assistance
                }
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card bg-light mb-4">
            <div className="card-body text-center">
              <div className="text-xs fw-semibold text-uppercase mb-1 text-muted">
                Assistance Coverage
              </div>
              <div className="h5 mb-0 text-info">
                {safeAnalytics.population_stats.assistance_coverage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Incidents by Type */}
        <div className="col-xl-6">
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-chart-pie me-1"></i>
              Incidents by Type
            </div>
            <div className="card-body">
              {safeAnalytics.incidents_by_type &&
              safeAnalytics.incidents_by_type.length > 0 ? (
                safeAnalytics.incidents_by_type.map((item, index) => (
                  <div key={item.incident_type || index} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-capitalize">
                        {item.incident_type?.replace(/_/g, " ") || "Unknown"}
                      </span>
                      <span>{item.count}</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${
                            safeAnalytics.total_incidents > 0
                              ? (item.count / safeAnalytics.total_incidents) *
                                100
                              : 0
                          }%`,
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-chart-pie fa-2x mb-2"></i>
                  <p>No incident type data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Incidents by Severity */}
        <div className="col-xl-6">
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-exclamation-circle me-1"></i>
              Incidents by Severity
            </div>
            <div className="card-body">
              {safeAnalytics.incidents_by_severity &&
              safeAnalytics.incidents_by_severity.length > 0 ? (
                safeAnalytics.incidents_by_severity.map((item, index) => (
                  <div key={item.severity || index} className="mb-2">
                    <div className="d-flex align-items-center">
                      <div
                        className="color-indicator me-2"
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: `hsl(${index * 90}, 70%, 50%)`,
                        }}
                      ></div>
                      <span className="flex-grow-1 text-capitalize">
                        {item.severity?.toLowerCase() || "unknown"}
                      </span>
                      <span className="badge bg-secondary">{item.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-exclamation-circle fa-2x mb-2"></i>
                  <p>No severity data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-4">
        <button
          className="btn btn-primary"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          <i className="fas fa-sync-alt me-2"></i>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
};

export default BarangayAnalytics;
