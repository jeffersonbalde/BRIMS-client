// pages/barangay/AffectedPopulation.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showToast } from "../../../services/notificationService";

const AffectedPopulation = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [affectedData, setAffectedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [actionLock, setActionLock] = useState(false);

  useEffect(() => {
    fetchAffectedPopulation();
  }, []);

  const fetchAffectedPopulation = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/population/affected`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAffectedData(data.data);
        } else {
          throw new Error(data.message);
        }
      } else {
        throw new Error('Failed to fetch affected population data');
      }
    } catch (error) {
      console.error('Error fetching affected population:', error);
      showToast.error('Failed to load affected population data');
      setAffectedData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  const filterAndSortData = () => {
    let filtered = [...affectedData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.incident?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.incident?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.incident?.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (item) => item.incident?.type === filterType
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortField === "date") {
        aValue = new Date(a.incident?.date || a.incident?.created_at);
        bValue = new Date(b.incident?.date || b.incident?.created_at);
      } else if (sortField === "title") {
        aValue = a.incident?.title?.toLowerCase();
        bValue = b.incident?.title?.toLowerCase();
      } else if (sortField === "affected") {
        aValue = a.population_data?.displaced_persons || 0;
        bValue = b.population_data?.displaced_persons || 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (field) => {
    if (actionLock) return;
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const filteredData = filterAndSortData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatLocalDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "Date Error";
    }
  };

  const getUniqueValues = (field) => {
    const values = [...new Set(affectedData.map(item => item.incident?.[field]).filter(Boolean))];
    return values.sort();
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      Flood: "fa-water",
      Landslide: "fa-mountain",
      Fire: "fa-fire",
      Earthquake: "fa-house-damage",
      Vehicular: "fa-car-crash",
    };
    return typeIcons[type] || "fa-exclamation-triangle";
  };

  // Skeleton Loaders
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

  const CardSkeleton = () => (
    <div className="col-xl-4 col-md-6 mb-4">
      <div className="card h-100">
        <div className="card-header">
          <div className="skeleton-line mb-2" style={{ height: "16px" }}></div>
          <div className="skeleton-line" style={{ width: "60%", height: "12px" }}></div>
        </div>
        <div className="card-body">
          <div className="row text-center mb-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="col-4">
                <div className={i < 2 ? "border-end" : ""}>
                  <div className="skeleton-line mb-1" style={{ height: "20px" }}></div>
                  <div className="skeleton-line" style={{ width: "70%", height: "12px", margin: "0 auto" }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-line mb-2" style={{ height: "14px" }}></div>
            ))}
          </div>
        </div>
        <div className="card-footer bg-transparent">
          <div className="skeleton-line mb-1" style={{ height: "12px" }}></div>
          <div className="skeleton-line" style={{ width: "80%", height: "12px" }}></div>
        </div>
      </div>
    </div>
  );

  const isActionDisabled = () => {
    return actionLock;
  };

  // Calculate stats
  const calculateStats = () => {
    const totalAffected = affectedData.reduce((sum, item) => sum + (item.population_data?.displaced_persons || 0), 0);
    const totalFamiliesNeedingHelp = affectedData.reduce((sum, item) => sum + (item.population_data?.families_requiring_assistance || 0), 0);
    const totalFamiliesAssisted = affectedData.reduce((sum, item) => sum + (item.population_data?.families_assisted || 0), 0);
    const totalIncidents = affectedData.length;

    return {
      totalAffected,
      totalFamiliesNeedingHelp,
      totalFamiliesAssisted,
      totalIncidents
    };
  };

  const stats = calculateStats();

  return (
    <div className="container-fluid px-1">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1 text-dark">Affected Population</h1>
          <p className="text-muted mb-0">
            Population data from incident reports in {user?.barangay_name}
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
            <i className="fas fa-users me-2"></i>
            <span className="d-none d-sm-inline">Total Incidents:</span>
            <span> {loading ? "..." : affectedData.length}</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchAffectedPopulation}
            disabled={isActionDisabled()}
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

      {/* Stats Cards */}
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
                        {stats.totalIncidents}
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
                        Total Affected
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "var(--accent-color)" }}>
                        {stats.totalAffected}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-users fa-lg" style={{ color: "var(--accent-light)", opacity: 0.7 }}></i>
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
                        Need Assistance
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "#ffc107" }}>
                        {stats.totalFamiliesNeedingHelp}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-hands-helping fa-lg" style={{ color: "#ffc107", opacity: 0.7 }}></i>
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
                        Assisted
                      </div>
                      <div className="h4 mb-0 fw-bold" style={{ color: "#198754" }}>
                        {stats.totalFamiliesAssisted}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-check-circle fa-lg" style={{ color: "#198754", opacity: 0.7 }}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 g-md-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold mb-1">
                Search Population Data
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by incident title, location, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isActionDisabled()}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchTerm("")}
                    disabled={isActionDisabled()}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Incident Type</label>
              <select
                className="form-select form-select-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={loading || isActionDisabled()}
              >
                <option value="all">All Types</option>
                {getUniqueValues("type").map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Sort By</label>
              <select
                className="form-select form-select-sm"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                disabled={loading || isActionDisabled()}
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="affected">Affected</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Order</label>
              <select
                className="form-select form-select-sm"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                disabled={loading || isActionDisabled()}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <div className="col-6 col-md-1">
              <label className="form-label small fw-semibold mb-1">Items</label>
              <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                disabled={loading || isActionDisabled()}
              >
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
              <i className="fas fa-users me-2"></i>
              Population Data
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredData.length} found
                  {searchTerm || filterType !== "all" ? " after filtering" : ""})
                </small>
              )}
            </h6>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={fetchAffectedPopulation}
                disabled={loading || isActionDisabled()}
                title="Refresh Data"
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            // Loading state
            <div className="row">
              {[...Array(6)].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : currentData.length === 0 ? (
            // Empty state
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-users fa-4x text-muted opacity-50"></i>
              </div>
              <h5 className="text-muted mb-3">
                {affectedData.length === 0
                  ? "No Population Data Available"
                  : "No Matching Results"}
              </h5>
              <p className="text-muted mb-4">
                {affectedData.length === 0
                  ? "Population data will appear here once you add it to your incident reports."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {(searchTerm || filterType !== "all") && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
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
              <div className="row">
                {currentData.map((item, index) => (
                  <div key={item.incident?.id || index} className="col-xl-4 col-md-6 mb-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-dark">{item.incident?.title || 'No Title'}</h6>
                          <small className="text-muted">
                            {formatLocalDate(item.incident?.date || item.incident?.created_at)}
                          </small>
                        </div>
                        <div className="flex-shrink-0 ms-2">
                          <span className="badge bg-light text-dark border">
                            <i className={`fas ${getTypeIcon(item.incident?.type)} me-1`}></i>
                            {item.incident?.type || 'Not specified'}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row text-center mb-3">
                          <div className="col-4">
                            <div className="border-end">
                              <div className="h5 text-primary mb-1">
                                {item.population_data?.displaced_persons || 0}
                              </div>
                              <small className="text-muted">Affected</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="border-end">
                              <div className="h5 text-warning mb-1">
                                {item.population_data?.families_requiring_assistance || 0}
                              </div>
                              <small className="text-muted">Need Help</small>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="h5 text-success mb-1">
                              {item.population_data?.families_assisted || 0}
                            </div>
                            <small className="text-muted">Assisted</small>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <small className="text-muted d-block mb-1">
                            <i className="fas fa-male me-1"></i>
                            Male: {item.population_data?.male_count || 0}
                          </small>
                          <small className="text-muted d-block mb-1">
                            <i className="fas fa-female me-1"></i>
                            Female: {item.population_data?.female_count || 0}
                          </small>
                          <small className="text-muted d-block">
                            <i className="fas fa-heart me-1"></i>
                            PWD: {item.population_data?.pwd_count || 0}
                          </small>
                        </div>
                      </div>
                      <div className="card-footer bg-transparent">
                        <small className="text-muted d-block mb-1">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {item.incident?.location || 'No location specified'}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
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

export default AffectedPopulation;