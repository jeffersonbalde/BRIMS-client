// pages/admin/PopulationData.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showToast } from "../../../services/notificationService";

const PopulationData = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [barangayData, setBarangayData] = useState([]);
  const [filterBarangay, setFilterBarangay] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalBarangays: 0,
    barangaysWithData: 0
  });
  const [error, setError] = useState(null);
  const [actionLock, setActionLock] = useState(false);

  useEffect(() => {
    fetchBarangayPopulationData();
  }, []);

  const fetchBarangayPopulationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching barangay population data...');
      
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/barangays/population-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.success) {
        setBarangayData(data.barangays || []);
        setStats({
          totalBarangays: data.total_barangays || 0,
          barangaysWithData: data.barangays_with_data || 0
        });
      } else {
        throw new Error(data.message || 'Failed to fetch data from server');
      }
    } catch (error) {
      console.error('Error fetching barangay population data:', error);
      setError(error.message);
      showToast.error('Failed to load population data: ' + error.message);
      setBarangayData([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique barangays for filter
  const getUniqueBarangays = () => {
    const barangays = [...new Set(barangayData.map(item => item.barangay_name).filter(Boolean))];
    return barangays.sort();
  };

  // Filter data based on search and barangay filter
  const filteredData = barangayData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.barangay_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.municipality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBarangay = filterBarangay === 'all' || 
      item.barangay_name === filterBarangay;
    
    return matchesSearch && matchesBarangay;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 0;
    return num;
  };

  const getAssistancePercentage = (populationData) => {
    if (!populationData) return 0;
    const families_requiring_assistance = populationData.families_requiring_assistance || 0;
    const families_assisted = populationData.families_assisted || 0;
    
    if (families_requiring_assistance === 0) return 0;
    return ((families_assisted / families_requiring_assistance) * 100).toFixed(1);
  };

  const getDataStatusBadge = (hasData) => {
    if (hasData) {
      return <span className="badge bg-success">Has Data</span>;
    } else {
      return <span className="badge bg-secondary">No Data</span>;
    }
  };

  const isActionDisabled = () => {
    return actionLock;
  };

  // Skeleton Loaders - Matching IncidentManagement pattern
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
      <td>
        <div className="skeleton-line mb-1"></div>
        <div className="skeleton-line" style={{ width: "80%" }}></div>
      </td>
      <td>
        <div className="skeleton-badge"></div>
      </td>
      <td className="text-center">
        <div className="skeleton-line" style={{ width: "40px", margin: "0 auto" }}></div>
      </td>
      <td className="text-center">
        <div className="skeleton-line" style={{ width: "60px", margin: "0 auto" }}></div>
      </td>
      <td className="text-center">
        <div className="skeleton-line" style={{ width: "50px", margin: "0 auto" }}></div>
      </td>
      <td className="text-center">
        <div className="skeleton-line" style={{ width: "70px", margin: "0 auto" }}></div>
      </td>
      <td className="text-center">
        <div className="skeleton-badge" style={{ width: "80px", margin: "0 auto" }}></div>
      </td>
    </tr>
  );

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

  if (error) {
    return (
      <div className="container-fluid px-1">
        <div className="card shadow border-0">
          <div className="card-body text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h5 className="text-danger mb-3">Failed to Load Population Data</h5>
            <p className="text-muted mb-4">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={fetchBarangayPopulationData}
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

  return (
    <div className="container-fluid px-1">
      {/* Page Header - Matching IncidentManagement pattern */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1 text-dark">Barangay Population Data</h1>
          <p className="text-muted mb-0">
            Population data overview for all barangays
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
            <i className="fas fa-map-marker-alt me-2"></i>
            <span className="d-none d-sm-inline">Total Barangays:</span>
            <span> {loading ? "..." : stats.totalBarangays}</span>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchBarangayPopulationData}
            disabled={loading || isActionDisabled()}
            style={{
              backgroundColor: "var(--btn-primary-bg)",
              borderColor: "var(--btn-primary-bg)",
            }}
          >
            <i className="fas fa-sync-alt me-1"></i>
            <span className="d-none d-sm-inline">Refresh Data</span>
            <span className="d-sm-none">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Overview - Matching IncidentManagement pattern */}
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
                        Total Barangays
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "var(--primary-color)" }}>
                        {stats.totalBarangays}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-map-marker-alt fa-lg" style={{ color: "var(--primary-light)", opacity: 0.7 }}></i>
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
                        With Data
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "#198754" }}>
                        {stats.barangaysWithData}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-database fa-lg" style={{ color: "#198754", opacity: 0.7 }}></i>
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
                        Without Data
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "#ffc107" }}>
                        {stats.totalBarangays - stats.barangaysWithData}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-exclamation-circle fa-lg" style={{ color: "#ffc107", opacity: 0.7 }}></i>
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
                        Total Incidents
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "#17a2b8" }}>
                        {barangayData.reduce((sum, item) => sum + item.total_incidents, 0)}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-file-alt fa-lg" style={{ color: "#17a2b8", opacity: 0.7 }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search and Filter Controls - Matching IncidentManagement pattern */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 g-md-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold mb-1">
                Search Barangays
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by barangay name or municipality..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={isActionDisabled()}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchTerm('')}
                    disabled={isActionDisabled()}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-6 col-md-4">
              <label className="form-label small fw-semibold mb-1">
                Filter by Barangay
              </label>
              <select
                className="form-select form-select-sm"
                value={filterBarangay}
                onChange={(e) => {
                  setFilterBarangay(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loading || isActionDisabled()}
              >
                <option value="all">All Barangays ({getUniqueBarangays().length})</option>
                {getUniqueBarangays().map(barangay => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Items</label>
              <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                disabled={loading || isActionDisabled()}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1 d-block">&nbsp;</label>
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterBarangay('all');
                  setCurrentPage(1);
                }}
                disabled={isActionDisabled() || (!searchTerm && filterBarangay === 'all')}
              >
                <i className="fas fa-times me-1"></i>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card - Matching IncidentManagement pattern */}
      <div className="card shadow border-0">
        <div
          className="card-header py-3"
          style={{
            backgroundColor: "var(--primary-color)",
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
          }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
            <h6 className="card-title mb-0 text-white">
              <i className="fas fa-table me-2"></i>
              Barangay Population Overview
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredData.length} found
                  {searchTerm || filterBarangay !== 'all'
                    ? " after filtering"
                    : ""}
                  )
                </small>
              )}
            </h6>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={fetchBarangayPopulationData}
                disabled={loading || isActionDisabled()}
                title="Refresh Data"
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            // Loading state
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "var(--background-light)" }}>
                  <tr>
                    <th className="text-center fw-bold" style={{ width: "50px", fontSize: "0.875rem" }}>#</th>
                    <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                    <th style={{ fontSize: "0.875rem" }}>Municipality</th>
                    <th style={{ fontSize: "0.875rem" }}>Data Status</th>
                    <th className="text-center" style={{ fontSize: "0.875rem" }}>Total Population</th>
                    <th className="text-center" style={{ fontSize: "0.875rem" }}>Displaced Persons</th>
                    <th className="text-center" style={{ fontSize: "0.875rem" }}>Families Assisted</th>
                    <th className="text-center" style={{ fontSize: "0.875rem" }}>Special Groups</th>
                    <th className="text-center" style={{ fontSize: "0.875rem" }}>Incidents</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))}
                </tbody>
              </table>
              <div className="text-center py-4">
                <div className="spinner-border text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted">Fetching population data...</span>
              </div>
            </div>
          ) : currentData.length === 0 ? (
            // Empty state
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-map-marker-alt fa-4x text-muted opacity-50"></i>
              </div>
              <h5 className="text-muted mb-3">
                {barangayData.length === 0
                  ? "No Population Data Available"
                  : "No Matching Results"}
              </h5>
              <p className="text-muted mb-4">
                {barangayData.length === 0
                  ? "Population data will appear here once barangays are added to the system."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {(searchTerm || filterBarangay !== 'all') && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBarangay('all');
                  }}
                  disabled={isActionDisabled()}
                >
                  <i className="fas fa-times me-2"></i>Clear Filters
                </button>
              )}
            </div>
          ) : (
            // Loaded state with data
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead style={{ backgroundColor: "var(--background-light)" }}>
                    <tr>
                      <th className="text-center fw-bold" style={{ width: "50px", fontSize: "0.875rem" }}>#</th>
                      <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                      <th style={{ fontSize: "0.875rem" }}>Municipality</th>
                      <th style={{ fontSize: "0.875rem" }}>Data Status</th>
                      <th className="text-center" style={{ fontSize: "0.875rem" }}>Total Population</th>
                      <th className="text-center" style={{ fontSize: "0.875rem" }}>Displaced Persons</th>
                      <th className="text-center" style={{ fontSize: "0.875rem" }}>Families Assisted</th>
                      <th className="text-center" style={{ fontSize: "0.875rem" }}>Special Groups</th>
                      <th className="text-center" style={{ fontSize: "0.875rem" }}>Incidents</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.map((barangay, index) => (
                      <tr
                        key={barangay.barangay_name}
                        className="align-middle"
                        style={{ height: "70px" }}
                      >
                        <td className="text-center fw-bold text-muted" style={{ fontSize: "0.9rem" }}>
                          {startIndex + index + 1}
                        </td>
                        
                        <td>
                          <strong className="text-dark">{barangay.barangay_name}</strong>
                        </td>
                        
                        <td>
                          <span className="text-muted">{barangay.municipality}</span>
                        </td>
                        
                        <td>
                          {getDataStatusBadge(barangay.has_population_data)}
                        </td>
                        
                        <td className="text-center">
                          <strong className={barangay.population_data.total_population > 0 ? "text-primary" : "text-muted"}>
                            {formatNumber(barangay.population_data.total_population)}
                          </strong>
                        </td>
                        
                        <td className="text-center">
                          <div>
                            <div className="small">
                              <span className={barangay.population_data.displaced_persons > 0 ? "text-warning" : "text-muted"}>
                                {formatNumber(barangay.population_data.displaced_persons)} persons
                              </span>
                            </div>
                            <div className="small text-muted">
                              {formatNumber(barangay.population_data.displaced_families)} families
                            </div>
                          </div>
                        </td>
                        
                        <td className="text-center">
                          <div>
                            <div className="small">
                              <span className={barangay.population_data.families_assisted > 0 ? "text-success" : "text-muted"}>
                                {formatNumber(barangay.population_data.families_assisted)} assisted
                              </span>
                            </div>
                            <div className="small text-muted">
                              {getAssistancePercentage(barangay.population_data)}% coverage
                            </div>
                          </div>
                        </td>
                        
                        <td className="text-center">
                          <div className="small">
                            <div>PWD: {formatNumber(barangay.population_data.pwd_count)}</div>
                            <div>Elderly: {formatNumber(barangay.population_data.elderly_count)}</div>
                            <div>Pregnant: {formatNumber(barangay.population_data.pregnant_count)}</div>
                          </div>
                        </td>
                        
                        <td className="text-center">
                          <span className={`badge ${barangay.total_incidents > 0 ? 'bg-info' : 'bg-secondary'}`}>
                            {barangay.total_incidents} incident(s)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Matching IncidentManagement pattern */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-top-0 py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="text-center text-md-start">
                      <small className="text-muted">
                        Showing{" "}
                        <span className="fw-semibold">
                          {startIndex + 1}-
                          {Math.min(endIndex, filteredData.length)}
                        </span>{" "}
                        of{" "}
                        <span className="fw-semibold">
                          {filteredData.length}
                        </span>{" "}
                        entries
                      </small>
                    </div>

                    <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm pagination-btn"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1 || isActionDisabled()}
                          style={{
                            backgroundColor: "transparent",
                            borderColor: "var(--primary-color)",
                            color: "var(--primary-color)",
                            minWidth: "80px",
                          }}
                        >
                          <i className="fas fa-chevron-left me-1 d-none d-sm-inline"></i>
                          <span className="d-none d-sm-inline">Previous</span>
                          <span className="d-sm-none">Prev</span>
                        </button>

                        <div className="d-none d-md-flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              if (totalPages <= 7) return true;
                              if (page === 1 || page === totalPages)
                                return true;
                              if (Math.abs(page - currentPage) <= 1)
                                return true;
                              return false;
                            })
                            .map((page, index, array) => {
                              const showEllipsis =
                                index > 0 && page - array[index - 1] > 1;
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && (
                                    <span className="px-2 text-muted">...</span>
                                  )}
                                  <button
                                    className={`btn btn-sm pagination-page-btn ${
                                      currentPage === page ? "active" : ""
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={isActionDisabled()}
                                    style={
                                      currentPage === page
                                        ? {
                                            backgroundColor:
                                              "var(--btn-primary-bg)",
                                            borderColor:
                                              "var(--btn-primary-bg)",
                                            minWidth: "40px",
                                            color: "white",
                                          }
                                        : {
                                            backgroundColor: "transparent",
                                            borderColor: "var(--primary-color)",
                                            color: "var(--primary-color)",
                                            minWidth: "40px",
                                          }
                                    }
                                  >
                                    {page}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                        </div>

                        <div className="d-md-none d-flex align-items-center px-3">
                          <small className="text-muted">
                            Page <span className="fw-bold">{currentPage}</span>{" "}
                            of <span className="fw-bold">{totalPages}</span>
                          </small>
                        </div>

                        <button
                          className="btn btn-sm pagination-btn"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={
                            currentPage === totalPages || isActionDisabled()
                          }
                          style={{
                            backgroundColor: "transparent",
                            borderColor: "var(--primary-color)",
                            color: "var(--primary-color)",
                            minWidth: "80px",
                          }}
                        >
                          <span className="d-none d-sm-inline">Next</span>
                          <span className="d-sm-none">Next</span>
                          <i className="fas fa-chevron-right ms-1 d-none d-sm-inline"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Global Action Lock Overlay */}
      {actionLock && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div className="bg-white rounded p-3 shadow-sm d-flex align-items-center">
            <div className="spinner-border text-primary me-2" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <span className="text-muted">Processing action...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopulationData;