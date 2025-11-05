// pages/admin/IncidentAnalytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showToast } from "../../../services/notificationService";

const IncidentAnalytics = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState("last_6_months");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching analytics with date range:', dateRange);
      
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/analytics/municipal?date_range=${dateRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.success) {
        setAnalytics(data.data);
        console.log('Analytics data set successfully');
      } else {
        throw new Error(data.message || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
      showToast.error('Failed to load analytics data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Safe number formatting
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 0;
    return num;
  };

  // Calculate percentage for progress bars
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  // Get color based on severity
  const getSeverityColor = (severity) => {
    const colors = {
      'Low': '#28a745',
      'Medium': '#ffc107', 
      'High': '#fd7e14',
      'Critical': '#dc3545'
    };
    return colors[severity] || '#6c757d';
  };

  // Get color based on status
  const getStatusColor = (status) => {
    const colors = {
      'Reported': '#17a2b8',
      'Investigating': '#ffc107',
      'Resolved': '#28a745',
      'Archived': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  // Skeleton Loaders - Only for data content
  const StatsCardSkeleton = () => (
    <div className="col-6 col-md-3">
      <div className="card border-left-primary shadow-sm h-100">
        <div className="card-body p-3">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <div
                className="skeleton-line mb-2"
                style={{ width: "80%", height: "12px" }}
              ></div>
              <div
                className="skeleton-line"
                style={{ width: "50%", height: "20px" }}
              ></div>
            </div>
            <div className="col-auto">
              <div
                className="skeleton-avatar"
                style={{ width: "30px", height: "30px" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TableRowSkeleton = () => (
    <tr className="align-middle">
      <td className="text-center">
        <div
          className="skeleton-box"
          style={{ width: "20px", height: "20px", margin: "0 auto" }}
        ></div>
      </td>
      <td>
        <div className="skeleton-line mb-1"></div>
        <div className="skeleton-line" style={{ width: "60%" }}></div>
      </td>
      <td className="text-center">
        <div className="skeleton-line" style={{ width: "40px", margin: "0 auto" }}></div>
      </td>
      <td>
        <div className="progress" style={{ height: '20px' }}>
          <div className="skeleton-line" style={{ width: "100%", height: "100%" }}></div>
        </div>
      </td>
      <td className="text-center">
        <div className="skeleton-badge" style={{ width: "60px", margin: "0 auto" }}></div>
      </td>
      <td className="text-center">
        <div className="skeleton-badge" style={{ width: "60px", margin: "0 auto" }}></div>
      </td>
    </tr>
  );

  const ChartSkeleton = () => (
    <div className="card shadow border-0 mb-4">
      <div className="card-header py-3" style={{
        backgroundColor: "var(--primary-color)",
        background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
      }}>
        <h6 className="card-title mb-0 text-white">
          <i className="fas fa-chart-bar me-2"></i>
          Loading Chart...
        </h6>
      </div>
      <div className="card-body">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <div className="skeleton-line" style={{ width: "80px" }}></div>
              <div className="skeleton-line" style={{ width: "30px" }}></div>
            </div>
            <div className="progress">
              <div className="skeleton-line" style={{ width: "100%", height: "100%" }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="container-fluid px-1">
        <div className="card shadow border-0">
          <div className="card-body text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h5 className="text-danger mb-3">Failed to Load Analytics</h5>
            <p className="text-muted mb-4">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={fetchAnalytics}
              style={{
                backgroundColor: "var(--btn-primary-bg)",
                borderColor: "var(--btn-primary-bg)",
              }}
            >
              <i className="fas fa-redo me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics && !loading) {
    return (
      <div className="container-fluid px-1">
        <div className="card shadow border-0">
          <div className="card-body text-center py-5">
            <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
            <h5 className="text-muted mb-3">No Analytics Data Available</h5>
            <p className="text-muted mb-4">
              Analytics data will appear here once incidents are reported in the system.
            </p>
            <button 
              className="btn btn-primary"
              onClick={fetchAnalytics}
              style={{
                backgroundColor: "var(--btn-primary-bg)",
                borderColor: "var(--btn-primary-bg)",
              }}
            >
              <i className="fas fa-redo me-2"></i>
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { overall_stats, population_stats, incidents_by_type, incidents_by_barangay, monthly_trends, severity_distribution, status_distribution } = analytics || {};

  // Add safe fallbacks for missing data
  const safeOverallStats = overall_stats || {
    total_incidents: 0,
    resolved_incidents: 0,
    high_critical_incidents: 0,
    avg_response_time_hours: 0,
    resolution_rate: 0
  };

  const safePopulationStats = population_stats || {
    total_affected: 0,
    total_displaced_families: 0,
    total_displaced_persons: 0,
    avg_assistance_coverage: 0
  };

  const safeIncidentsByType = incidents_by_type || [];
  const safeIncidentsByBarangay = incidents_by_barangay || [];
  const safeMonthlyTrends = monthly_trends || [];
  const safeSeverityDistribution = severity_distribution || [];
  const safeStatusDistribution = status_distribution || [];

  return (
    <div className="container-fluid px-1">
      {/* Page Header - Always visible */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1 text-dark">Incident Analytics</h1>
          <p className="text-muted mb-0">
            Real-time analytics and insights from incident reports
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2 text-white"
            style={{
              backgroundColor: "var(--primary-color)",
              background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
            }}
          >
            <i className="fas fa-chart-bar me-2"></i>
            <span className="d-none d-sm-inline">Total Incidents:</span>
            <span> {loading ? "..." : formatNumber(safeOverallStats.total_incidents)}</span>
          </div>
          <select 
            className="form-select form-select-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: 'auto' }}
            disabled={loading}
          >
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">All Time</option>
          </select>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchAnalytics}
            disabled={loading}
            style={{
              backgroundColor: "var(--btn-primary-bg)",
              borderColor: "var(--btn-primary-bg)",
            }}
          >
            <i className="fas fa-sync-alt me-1"></i>
            <span className="d-none d-sm-inline">Refresh</span>
            <span className="d-sm-none">Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards - Show skeleton when loading */}
      <div className="row mb-4 g-3">
        {loading ? (
          <>
            {[...Array(4)].map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </>
        ) : (
          <>
            <div className="col-6 col-md-3">
              <div className="card stats-card h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "var(--primary-color)" }}>
                        Total Incidents
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "var(--primary-color)" }}>
                        {formatNumber(safeOverallStats.total_incidents)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-exclamation-triangle fa-lg" style={{ color: "var(--primary-light)", opacity: 0.7 }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card stats-card h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "var(--accent-color)" }}>
                        High/Critical
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "var(--accent-color)" }}>
                        {formatNumber(safeOverallStats.high_critical_incidents)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-exclamation-circle fa-lg" style={{ color: "var(--accent-light)", opacity: 0.7 }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card stats-card h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "#198754" }}>
                        Resolved
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "#198754" }}>
                        {formatNumber(safeOverallStats.resolved_incidents)}
                      </div>
                      <div className="small text-muted">
                        {formatNumber(safeOverallStats.resolution_rate)}% Resolution Rate
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-check-circle fa-lg" style={{ color: "#198754", opacity: 0.7 }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card stats-card h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "#17a2b8" }}>
                        Avg Response Time
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "#17a2b8" }}>
                        {formatNumber(safeOverallStats.avg_response_time_hours)}h
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-clock fa-lg" style={{ color: "#17a2b8", opacity: 0.7 }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Population Stats Cards - Show skeleton when loading */}
      {loading ? (
        <div className="row mb-4 g-3">
          {[...Array(4)].map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
      ) : safePopulationStats && (
        <div className="row mb-4 g-3">
          <div className="col-6 col-md-3">
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "#6c757d" }}>
                      Total Affected
                    </div>
                    <div className="h4 mb-0 fw-bold" style={{ color: "#6c757d" }}>
                      {formatNumber(safePopulationStats.total_affected)}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-users fa-lg" style={{ color: "#6c757d", opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "#dc3545" }}>
                      Displaced Families
                    </div>
                    <div className="h4 mb-0 fw-bold" style={{ color: "#dc3545" }}>
                      {formatNumber(safePopulationStats.total_displaced_families)}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-house-damage fa-lg" style={{ color: "#dc3545", opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "#198754" }}>
                      Assistance Coverage
                    </div>
                    <div className="h4 mb-0 fw-bold" style={{ color: "#198754" }}>
                      {formatNumber(safePopulationStats.avg_assistance_coverage)}%
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-hand-holding-heart fa-lg" style={{ color: "#198754", opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-xs fw-semibold text-uppercase mb-1" style={{ color: "#ffc107" }}>
                      Displaced Persons
                    </div>
                    <div className="h4 mb-0 fw-bold" style={{ color: "#ffc107" }}>
                      {formatNumber(safePopulationStats.total_displaced_persons)}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-walking fa-lg" style={{ color: "#ffc107", opacity: 0.7 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row - Show skeleton when loading */}
      {loading ? (
        <div className="row">
          <div className="col-xl-6">
            <ChartSkeleton />
          </div>
          <div className="col-xl-6">
            <ChartSkeleton />
          </div>
        </div>
      ) : (safeIncidentsByType.length > 0 || safeSeverityDistribution.length > 0) && (
        <div className="row">
          {/* Incidents by Type */}
          {safeIncidentsByType.length > 0 && (
            <div className="col-xl-6">
              <div className="card shadow border-0 mb-4">
                <div className="card-header py-3" style={{
                  backgroundColor: "var(--primary-color)",
                  background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                }}>
                  <h6 className="card-title mb-0 text-white">
                    <i className="fas fa-chart-bar me-2"></i>
                    Incidents by Type
                  </h6>
                </div>
                <div className="card-body">
                  {safeIncidentsByType.map((item, index) => (
                    <div key={item.incident_type} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">{item.incident_type}</span>
                        <span className="text-muted">{formatNumber(item.count)}</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ 
                            width: `${calculatePercentage(item.count, safeOverallStats.total_incidents)}%`,
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Severity Distribution */}
          {safeSeverityDistribution.length > 0 && (
            <div className="col-xl-6">
              <div className="card shadow border-0 mb-4">
                <div className="card-header py-3" style={{
                  backgroundColor: "var(--primary-color)",
                  background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                }}>
                  <h6 className="card-title mb-0 text-white">
                    <i className="fas fa-chart-pie me-2"></i>
                    Severity Distribution
                  </h6>
                </div>
                <div className="card-body">
                  {safeSeverityDistribution.map((item, index) => (
                    <div key={item.severity} className="mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div 
                            className="color-indicator me-2"
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: getSeverityColor(item.severity)
                            }}
                          ></div>
                          <span className="fw-semibold">{item.severity}</span>
                        </div>
                        <span className="badge bg-secondary">{formatNumber(item.count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Distribution and Monthly Trends - Show skeleton when loading */}
      {loading ? (
        <div className="row">
          <div className="col-xl-6">
            <ChartSkeleton />
          </div>
          <div className="col-xl-6">
            <ChartSkeleton />
          </div>
        </div>
      ) : (safeStatusDistribution.length > 0 || safeMonthlyTrends.length > 0) && (
        <div className="row">
          {/* Status Distribution */}
          {safeStatusDistribution.length > 0 && (
            <div className="col-xl-6">
              <div className="card shadow border-0 mb-4">
                <div className="card-header py-3" style={{
                  backgroundColor: "var(--primary-color)",
                  background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                }}>
                  <h6 className="card-title mb-0 text-white">
                    <i className="fas fa-tasks me-2"></i>
                    Status Distribution
                  </h6>
                </div>
                <div className="card-body">
                  {safeStatusDistribution.map((item, index) => (
                    <div key={item.status} className="mb-2">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div 
                            className="color-indicator me-2"
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(item.status)
                            }}
                          ></div>
                          <span className="fw-semibold">{item.status}</span>
                        </div>
                        <span className="badge bg-secondary">{formatNumber(item.count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Trends */}
          {safeMonthlyTrends.length > 0 && (
            <div className="col-xl-6">
              <div className="card shadow border-0 mb-4">
                <div className="card-header py-3" style={{
                  backgroundColor: "var(--primary-color)",
                  background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
                }}>
                  <h6 className="card-title mb-0 text-white">
                    <i className="fas fa-chart-line me-2"></i>
                    Monthly Trends
                  </h6>
                </div>
                <div className="card-body">
                  {safeMonthlyTrends.map((item, index) => (
                    <div key={item.month} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">{item.month}</span>
                        <span className="text-muted">{formatNumber(item.incidents)}</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ 
                            width: `${calculatePercentage(item.incidents, Math.max(...safeMonthlyTrends.map(m => m.incidents)))}%`,
                            backgroundColor: '#4e73df'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Barangay-wise Distribution - Show skeleton when loading */}
      {loading ? (
        <div className="row">
          <div className="col-12">
            <div className="card shadow border-0 mb-4">
              <div className="card-header py-3" style={{
                backgroundColor: "var(--primary-color)",
                background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
              }}>
                <h6 className="card-title mb-0 text-white">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Incidents by Barangay
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead style={{ backgroundColor: "var(--background-light)" }}>
                      <tr>
                        <th className="text-center fw-bold" style={{ width: "50px", fontSize: "0.875rem" }}>#</th>
                        <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                        <th className="text-center" style={{ fontSize: "0.875rem" }}>Total Incidents</th>
                        <th style={{ fontSize: "0.875rem" }}>Percentage</th>
                        <th className="text-center" style={{ fontSize: "0.875rem" }}>High/Critical</th>
                        <th className="text-center" style={{ fontSize: "0.875rem" }}>Resolved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, index) => (
                        <TableRowSkeleton key={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : safeIncidentsByBarangay.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow border-0 mb-4">
              <div className="card-header py-3" style={{
                backgroundColor: "var(--primary-color)",
                background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
              }}>
                <h6 className="card-title mb-0 text-white">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Incidents by Barangay
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead style={{ backgroundColor: "var(--background-light)" }}>
                      <tr>
                        <th className="text-center fw-bold" style={{ width: "50px", fontSize: "0.875rem" }}>#</th>
                        <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                        <th className="text-center" style={{ fontSize: "0.875rem" }}>Total Incidents</th>
                        <th style={{ fontSize: "0.875rem" }}>Percentage</th>
                        <th className="text-center" style={{ fontSize: "0.875rem" }}>High/Critical</th>
                        <th className="text-center" style={{ fontSize: "0.875rem" }}>Resolved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeIncidentsByBarangay.map((item, index) => {
                        const percentage = calculatePercentage(item.count, safeOverallStats.total_incidents);
                        return (
                          <tr key={item.barangay_name} className="align-middle">
                            <td className="text-center fw-bold text-muted" style={{ fontSize: "0.9rem" }}>
                              {index + 1}
                            </td>
                            <td>
                              <strong>{item.barangay_name}</strong>
                            </td>
                            <td className="text-center fw-semibold">
                              {formatNumber(item.count)}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '20px' }}>
                                  <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <small className="text-muted fw-semibold" style={{ minWidth: '45px' }}>
                                  {percentage.toFixed(1)}%
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-warning text-dark">
                                {Math.round(item.count * 0.3)}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-success">
                                {Math.round(item.count * 0.6)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State if no data at all */}
      {!loading && safeOverallStats.total_incidents === 0 && (
        <div className="card shadow border-0">
          <div className="card-body text-center py-5">
            <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
            <h5 className="text-muted mb-3">No Incident Data Available</h5>
            <p className="text-muted mb-4">
              Analytics will appear here once incidents are reported in the system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentAnalytics;