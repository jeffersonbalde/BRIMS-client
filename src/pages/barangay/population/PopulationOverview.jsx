// pages/barangay/PopulationOverview.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";

const PopulationOverview = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [populationData, setPopulationData] = useState(null);

  useEffect(() => {
    fetchPopulationOverview();
  }, []);

  // Update the fetchPopulationOverview function in PopulationOverview.jsx
  const fetchPopulationOverview = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/population/barangay-overview`,
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
        } else {
          throw new Error(data.message);
        }
      } else {
        throw new Error('Failed to fetch population overview');
      }
    } catch (error) {
      console.error('Error fetching population overview:', error);
      // Set default empty data with proper structure
      setPopulationData({
        total_population: 0,
        total_families: 0,
        total_displaced: 0,
        demographics: { male: 0, female: 0, lgbtqia: 0 },
        age_groups: {
          infant: 0, toddler: 0, preschooler: 0, 
          school_age: 0, teen_age: 0, adult: 0, elderly: 0
        },
        special_groups: {
          pwd: 0, pregnant: 0, elderly: 0, 
          lactating_mother: 0, solo_parent: 0, 
          indigenous_people: 0, child_headed_household: 0, 
          gbv_victims: 0
        },
        incidents_with_data: 0,
        barangay_name: user?.barangay_name || ''
      });
    } finally {
      setLoading(false);
    }
  };

  // Safe data access with fallbacks
  const safeData = populationData || {
    total_population: 0,
    total_families: 0,
    total_displaced: 0,
    demographics: { male: 0, female: 0, lgbtqia: 0 },
    age_groups: {
      infant: 0, toddler: 0, preschooler: 0, 
      school_age: 0, teen_age: 0, adult: 0, elderly: 0
    },
    special_groups: {
      pwd: 0, pregnant: 0, elderly: 0, 
      lactating_mother: 0, solo_parent: 0, 
      indigenous_people: 0, child_headed_household: 0, 
      gbv_victims: 0
    }
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
        <div>
          <h1 className="h3 mb-1 text-dark">Population Overview</h1>
          <p className="text-muted mb-0">
            Demographic data for {user?.barangay_name}
          </p>
        </div>
        <div className="badge bg-primary fs-6">
          <i className="fas fa-users me-2"></i>
          Total Population: {safeData.total_population}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-xs fw-semibold text-uppercase mb-1">Total Families</div>
                  <div className="h5 mb-0">{safeData.total_families}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-home fa-2x"></i>
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
                  <div className="text-xs fw-semibold text-uppercase mb-1">Male Population</div>
                  <div className="h5 mb-0">{safeData.demographics.male}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-male fa-2x"></i>
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
                  <div className="text-xs fw-semibold text-uppercase mb-1">Female Population</div>
                  <div className="h5 mb-0">{safeData.demographics.female}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-female fa-2x"></i>
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
                  <div className="text-xs fw-semibold text-uppercase mb-1">Special Groups</div>
                  <div className="h5 mb-0">
                    {safeData.special_groups.pwd + safeData.special_groups.pregnant + safeData.special_groups.solo_parent}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-heart fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Age Distribution */}
        <div className="col-xl-6">
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-child me-1"></i>
              Age Distribution
            </div>
            <div className="card-body">
              {Object.entries(safeData.age_groups).map(([ageGroup, count]) => (
                <div key={ageGroup} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-capitalize">{ageGroup.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                    <span>{count} ({safeData.total_population > 0 ? ((count / safeData.total_population) * 100).toFixed(1) : 0}%)</span>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ 
                        width: `${safeData.total_population > 0 ? (count / safeData.total_population) * 100 : 0}%`,
                        backgroundColor: '#4e73df'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Groups */}
        <div className="col-xl-6">
          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-heart me-1"></i>
              Special Groups
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6 className="card-title">PWD</h6>
                      <h4 className="text-primary">{safeData.special_groups.pwd}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6 className="card-title">Pregnant</h6>
                      <h4 className="text-success">{safeData.special_groups.pregnant}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6 className="card-title">Solo Parent</h6>
                      <h4 className="text-info">{safeData.special_groups.solo_parent}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h6 className="card-title">Indigenous</h6>
                      <h4 className="text-warning">{safeData.special_groups.indigenous_people}</h4>
                    </div>
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

export default PopulationOverview;