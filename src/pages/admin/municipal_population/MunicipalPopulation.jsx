// pages/admin/MunicipalPopulation.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";

const MunicipalPopulation = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [populationData, setPopulationData] = useState(null);

  useEffect(() => {
    fetchMunicipalPopulation();
  }, []);

  const fetchMunicipalPopulation = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/population/municipal-overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPopulationData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching municipal population:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safe number formatting function
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 0;
    return num;
  };

  // Safe percentage formatting
  const formatPercentage = (num) => {
    const value = formatNumber(num);
    return typeof value === 'number' ? value.toFixed(1) : '0.0';
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
        <h1 className="h3 mb-0 text-dark">Municipal Population Data</h1>
        <button 
          className="btn btn-primary"
          onClick={fetchMunicipalPopulation}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh Data
        </button>
      </div>

      {/* Overall Summary */}
      {populationData?.overall_totals && (
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card bg-primary text-white mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-xs fw-semibold text-uppercase mb-1">Total Affected Population</div>
                    <div className="h5 mb-0">{formatNumber(populationData.overall_totals.total_population)}</div>
                  </div>
                  <div className="col-auto">
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
                    <div className="text-xs fw-semibold text-uppercase mb-1">Affected Families</div>
                    <div className="h5 mb-0">{formatNumber(populationData.overall_totals.total_families)}</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-home fa-2x"></i>
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
                    <div className="text-xs fw-semibold text-uppercase mb-1">Displaced Persons</div>
                    <div className="h5 mb-0">{formatNumber(populationData.overall_totals.total_displaced)}</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-house-damage fa-2x"></i>
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
                    <div className="text-xs fw-semibold text-uppercase mb-1">Assistance Coverage</div>
                    <div className="h5 mb-0">{formatPercentage(populationData.overall_totals.assistance_coverage)}%</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-hand-holding-heart fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Population by Barangay */}
      {populationData?.by_barangay && Object.keys(populationData.by_barangay).length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-map-marker-alt me-2"></i>
              Population Data by Barangay
            </h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Barangay</th>
                    <th>Total Population</th>
                    <th>Affected Families</th>
                    <th>Displaced Persons</th>
                    <th>Incidents with Data</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(populationData.by_barangay).map(([barangay, data]) => (
                    <tr key={barangay}>
                      <td>
                        <strong>{barangay}</strong>
                      </td>
                      <td>{formatNumber(data.total_population)}</td>
                      <td>{formatNumber(data.total_families)}</td>
                      <td>{formatNumber(data.total_displaced)}</td>
                      <td>
                        <span className="badge bg-primary">{formatNumber(data.incident_count)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-users fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No Population Data Available</h5>
            <p className="text-muted">
              Population data will appear here once barangays start adding population data to their incident reports.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MunicipalPopulation;