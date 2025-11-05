// components/incident/IncidentList.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import IncidentReportModal from "./IncidentReportModal";
import IncidentViewModal from "./IncidentViewModal";
import IncidentEditModal from "./IncidentEditModal";
import PopulationDataModal from "../../admin_barangay/PopulationDataModal";
import InfrastructureStatusModal from "../../admin_barangay/InfrastructureStatusModal";

const IncidentList = () => {
  const { user, token } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);

  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const [viewMode, setViewMode] = useState("active"); // "active", "archived", "all"

  const [showPopulationModal, setShowPopulationModal] = useState(false);
  const [showInfrastructureModal, setShowInfrastructureModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    investigating: 0,
    resolved: 0,
    high_critical: 0,
  });

  useEffect(() => {
    fetchIncidents();
    fetchStats();
  }, []);

  // Update useEffect dependencies in barangay IncidentList
  useEffect(() => {
    filterAndSortIncidents();
  }, [
    incidents,
    searchTerm,
    filterType,
    filterSeverity,
    filterStatus,
    sortField,
    sortDirection,
    viewMode, // ADD THIS
  ]);

  useEffect(() => {
    // Reset status filter when switching to archived view mode
    if (viewMode === "archived" && filterStatus !== "all") {
      setFilterStatus("all");
    }
  }, [viewMode, filterStatus]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/incidents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setIncidents(data.incidents || []);
        } else {
          throw new Error(data.message || "Failed to fetch incidents");
        }
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to fetch incidents");
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      showAlert.error("Error", error.message || "Failed to load incidents");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/incidents/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const refreshAllData = async () => {
    if (actionLock) {
      showToast.warning("Please wait until current action completes");
      return;
    }
    await fetchIncidents();
    await fetchStats();
    showToast.info("Data refreshed successfully");
  };

  // Replace your filterAndSortIncidents function in IncidentList.jsx:
  const filterAndSortIncidents = () => {
    let filtered = [...incidents];

    // View mode filter - FIXED
    if (viewMode === "active") {
      filtered = filtered.filter((incident) => incident.status !== "Archived");
    } else if (viewMode === "archived") {
      filtered = filtered.filter((incident) => incident.status === "Archived");
    }
    // "all" shows everything - no filter needed

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          incident.incident_type
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (incident) => incident.incident_type === filterType
      );
    }

    // Severity filter
    if (filterSeverity !== "all") {
      filtered = filtered.filter(
        (incident) => incident.severity === filterSeverity
      );
    }

    // Status filter - UPDATED: Apply in all view modes
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (incident) => incident.status === filterStatus
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at" || sortField === "incident_date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredIncidents(filtered);
    setCurrentPage(1);
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

const handleAddPopulationData = async (incident) => {
  if (actionLock) {
    showToast.warning("Please wait until the current action completes");
    return;
  }

  setActionLock(true);
  setActionLoading(incident.id);

  try {
    // Show loading state immediately
    setSelectedIncident(incident);
    setShowPopulationModal(true);
    
    // The modal will handle fetching data internally
  } catch (error) {
    console.error("Error opening population modal:", error);
    showToast.error("Failed to open population data form");
  } finally {
    setActionLoading(null);
    setActionLock(false);
  }
};
const handleAddInfrastructureData = async (incident) => {
  if (actionLock) {
    showToast.warning("Please wait until the current action completes");
    return;
  }

  setActionLock(true);
  setActionLoading(incident.id);

  try {
    // Show loading state immediately
    setSelectedIncident(incident);
    setShowInfrastructureModal(true);
    
    // The modal will handle fetching data internally
  } catch (error) {
    console.error("Error opening infrastructure modal:", error);
    showToast.error("Failed to open infrastructure status form");
  } finally {
    setActionLoading(null);
    setActionLock(false);
  }
};

  const handleDelete = async (incidentId) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Delete Incident",
      "Are you sure you want to delete this incident? This action cannot be undone.",
      "Yes, Delete",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading(incidentId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/incidents/${incidentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        showToast.success("Incident deleted successfully!");
        setIncidents((prev) =>
          prev.filter((incident) => incident.id !== incidentId)
        );
        await fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete incident");
      }
    } catch (error) {
      console.error("Error deleting incident:", error);
      showAlert.error(
        "Deletion Failed",
        error.message || "Failed to delete incident. Please try again."
      );
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleView = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedIncident(incident);
    setShowViewModal(true);
  };

  const handleEdit = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    // Check if incident can be edited based on status and time
    const canEdit = canIncidentBeEdited(incident);
    if (!canEdit) {
      showToast.warning("This incident cannot be edited at this time");
      return;
    }

    setSelectedIncident(incident);
    setShowEditModal(true);
  };

  // components/incident/IncidentList.jsx - Update these functions:

  // Check if incident can be edited
  const canIncidentBeEdited = (incident) => {
    // If user is admin, they can always edit
    if (user.role === "admin") return true;

    // For barangay users, check if they can edit based on incident properties
    if (user.role === "barangay") {
      return incident.can_barangay_edit !== false;
    }

    // Default to true for other roles
    return true;
  };

  const canIncidentBeDeleted = (incident) => {
    // If user is admin, they can always delete
    if (user.role === "admin") return true;

    // For barangay users, check if they can delete based on incident properties
    if (user.role === "barangay") {
      return incident.can_barangay_delete !== false;
    }

    // Default to true for other roles
    return true;
  };

  const handleReportSuccess = () => {
    setShowReportModal(false);
    fetchIncidents();
    fetchStats();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedIncident(null);
    fetchIncidents();
    fetchStats();
  };

  const getSeverityBadge = (severity) => {
    const severityStyles = {
      Low: "bg-success text-white",
      Medium: "bg-warning text-dark",
      High: "bg-danger text-white",
      Critical: "bg-dark text-white",
    };
    return severityStyles[severity] || "bg-secondary text-white";
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Reported: "bg-primary text-white",
      Investigating: "bg-info text-white",
      Resolved: "bg-success text-white",
    };
    return statusStyles[status] || "bg-secondary text-white";
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

  const getUniqueValues = (field) => {
    if (field === "status") {
      // For status field, exclude "Archived" from filter options
      const values = [...new Set(incidents.map((incident) => incident[field]))];
      return values
        .filter((status) => status !== "Archived") // Remove Archived from dropdown
        .sort();
    }

    // For all other fields, return all values
    const values = [...new Set(incidents.map((incident) => incident[field]))];
    return values.sort();
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  const isActionDisabled = (incidentId = null) => {
    return actionLock || (actionLoading && actionLoading !== incidentId);
  };

  // Pagination
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncidents = filteredIncidents.slice(startIndex, endIndex);

  // Skeleton Loaders
  const TableRowSkeleton = () => (
    <tr className="align-middle">
      <td className="text-center">
        <div
          className="skeleton-box"
          style={{ width: "20px", height: "20px", margin: "0 auto" }}
        ></div>
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="skeleton-box"
              style={{ width: "30px", height: "30px" }}
            ></div>
          ))}
        </div>
      </td>
      <td>
        <div className="d-flex align-items-center">
          <div className="skeleton-avatar me-3"></div>
          <div className="flex-grow-1">
            <div className="skeleton-line mb-1"></div>
            <div className="skeleton-line" style={{ width: "80%" }}></div>
          </div>
        </div>
      </td>
      <td>
        <div className="skeleton-line mb-1"></div>
        <div className="skeleton-line" style={{ width: "60%" }}></div>
      </td>
      <td>
        <div className="skeleton-badge"></div>
      </td>
      <td>
        <div className="skeleton-badge"></div>
      </td>
      <td>
        <div className="skeleton-line" style={{ width: "70%" }}></div>
      </td>
      <td className="text-center">
        <div
          className="skeleton-line"
          style={{ width: "80%", margin: "0 auto" }}
        ></div>
      </td>
      <td className="text-center">
        <div
          className="skeleton-line"
          style={{ width: "60%", margin: "0 auto" }}
        ></div>
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

  // Local date formatting helpers
  const formatLocalDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      // Parse the date string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date Error";
    }
  };

  const formatLocalTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      // Parse the date string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Time";

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Time Error";
    }
  };

  // Add these functions after your existing helper functions:

  // Get button titles
  const getEditButtonTitle = (incident) => {
    if (!canIncidentBeEdited(incident)) {
      if (user.role === "barangay") {
        if (incident.status !== "Reported") {
          return "Cannot edit incidents that are already under investigation or resolved";
        } else {
          return "Can only edit incidents reported within the last hour";
        }
      }
      return "Cannot edit this incident";
    }
    return "Edit Incident";
  };

  const getDeleteButtonTitle = (incident) => {
    if (!canIncidentBeDeleted(incident)) {
      if (user.role === "barangay") {
        if (incident.status !== "Reported") {
          return "Cannot delete incidents that are already under investigation or resolved";
        } else {
          return "Can only delete incidents reported within the last hour";
        }
      }
      return "Cannot delete this incident";
    }
    return "Delete Incident";
  };

  // New functions with SweetAlert messages
  const handleEditWithAlert = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const canEdit = canIncidentBeEdited(incident);
    if (!canEdit) {
      if (user.role === "barangay") {
        if (incident.status !== "Reported") {
          showAlert.info(
            "Edit Not Allowed",
            `This incident is currently <strong>${incident.status.toLowerCase()}</strong> and cannot be edited. <br><br>Only incidents with "Reported" status can be modified by barangay users.`,
            "Okay"
          );
        } else {
          showAlert.info(
            "Edit Time Expired",
            `This incident was reported more than 1 hour ago and can no longer be edited. <br><br>Barangay users can only edit incidents within 1 hour of reporting.`,
            "Okay"
          );
        }
      } else {
        showAlert.info(
          "Edit Not Allowed",
          "You do not have permission to edit this incident.",
          "Okay"
        );
      }
      return;
    }

    setSelectedIncident(incident);
    setShowEditModal(true);
  };

  const handleDeleteWithAlert = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const canDelete = canIncidentBeDeleted(incident);
    if (!canDelete) {
      if (user.role === "barangay") {
        if (incident.status !== "Reported") {
          showAlert.info(
            "Delete Not Allowed",
            `This incident is currently <strong>${incident.status.toLowerCase()}</strong> and cannot be deleted. <br><br>Only incidents with "Reported" status can be deleted by barangay users.`,
            "Okay"
          );
        } else {
          showAlert.info(
            "Delete Time Expired",
            `This incident was reported more than 1 hour ago and can no longer be deleted. <br><br>Barangay users can only delete incidents within 1 hour of reporting.`,
            "Okay"
          );
        }
      } else {
        showAlert.info(
          "Delete Not Allowed",
          "You do not have permission to delete this incident.",
          "Okay"
        );
      }
      return;
    }

    handleDelete(incident.id);
  };

  return (
    <div className="container-fluid px-1">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1 text-dark">Incident Management</h1>
          <p className="text-muted mb-0">
            Monitor and manage reported incidents in your barangay
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2 text-white"
            style={{
              backgroundColor: "var(--primary-color)",
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
            }}
          >
            <i className="fas fa-exclamation-triangle me-2"></i>
            <span className="d-none d-sm-inline">Total Incidents:</span>
            <span> {loading ? "..." : incidents.length}</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowReportModal(true)}
            disabled={isActionDisabled()}
            style={{
              backgroundColor: "var(--btn-primary-bg)",
              borderColor: "var(--btn-primary-bg)",
            }}
          >
            <i className="fas fa-plus me-1"></i>
            <span className="d-none d-sm-inline">Report Incident</span>
            <span className="d-sm-none">Report</span>
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
                      <div
                        className="text-xs fw-semibold text-uppercase mb-1"
                        style={{ color: "var(--primary-color)" }}
                      >
                        Total Incidents
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "var(--primary-color)" }}
                      >
                        {stats.total}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className="fas fa-exclamation-triangle fa-lg"
                        style={{ color: "var(--primary-light)", opacity: 0.7 }}
                      ></i>
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
                      <div
                        className="text-xs fw-semibold text-uppercase mb-1"
                        style={{ color: "var(--accent-color)" }}
                      >
                        High/Critical
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {stats.high_critical}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className="fas fa-exclamation-circle fa-lg"
                        style={{ color: "var(--accent-light)", opacity: 0.7 }}
                      ></i>
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
                      <div
                        className="text-xs fw-semibold text-uppercase mb-1"
                        style={{ color: "#17a2b8" }}
                      >
                        Investigating
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "#17a2b8" }}
                      >
                        {stats.investigating}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className="fas fa-search fa-lg"
                        style={{ color: "#17a2b8", opacity: 0.7 }}
                      ></i>
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
                      <div
                        className="text-xs fw-semibold text-uppercase mb-1"
                        style={{ color: "#198754" }}
                      >
                        Resolved
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: "#198754" }}
                      >
                        {stats.resolved}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className="fas fa-check-circle fa-lg"
                        style={{ color: "#198754", opacity: 0.7 }}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* View Mode Toggle - ENHANCED WITH MATCHING STYLES */}
      <div className="card shadow border-0 mb-3">
        <div className="card-body py-3">
          <div className="row align-items-center">
            <div className="col-12 col-md-8 mb-3 mb-md-0">
              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                <div className="flex-shrink-0">
                  <label className="form-label small fw-semibold mb-1 d-block text-dark">
                    <i
                      className="fas fa-filter me-2"
                      style={{ color: "var(--primary-color)" }}
                    ></i>
                    View Mode
                  </label>
                </div>
                <div
                  className="btn-group btn-group-sm flex-grow-1 flex-sm-grow-0"
                  role="group"
                  aria-label="View mode"
                  style={{ minWidth: "fit-content" }}
                >
                  <button
                    type="button"
                    className={`btn fw-semibold ${
                      viewMode === "active"
                        ? "text-white"
                        : "btn-outline-primary text-primary"
                    }`}
                    onClick={() => setViewMode("active")}
                    disabled={loading || isActionDisabled()}
                    style={{
                      backgroundColor:
                        viewMode === "active"
                          ? "var(--btn-primary-bg)"
                          : "transparent",
                      borderColor: "var(--btn-primary-bg)",
                      borderWidth: "2px",
                      minWidth: "100px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (
                        !loading &&
                        !isActionDisabled() &&
                        viewMode !== "active"
                      ) {
                        e.target.style.backgroundColor =
                          "rgba(51, 107, 49, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        !loading &&
                        !isActionDisabled() &&
                        viewMode !== "active"
                      ) {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <i className="fas fa-list me-2"></i>
                    Active
                    <span
                      className="badge ms-2"
                      style={{
                        backgroundColor:
                          viewMode === "active"
                            ? "rgba(255,255,255,0.9)"
                            : "var(--btn-primary-bg)",
                        color:
                          viewMode === "active"
                            ? "var(--primary-color)"
                            : "white",
                      }}
                    >
                      {incidents.filter((i) => i.status !== "Archived").length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`btn fw-semibold ${
                      viewMode === "archived"
                        ? "text-white"
                        : "btn-outline-warning text-warning"
                    }`}
                    onClick={() => setViewMode("archived")}
                    disabled={loading || isActionDisabled()}
                    style={{
                      backgroundColor:
                        viewMode === "archived" ? "#ffc107" : "transparent",
                      borderColor: "#ffc107",
                      borderWidth: "2px",
                      minWidth: "120px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (
                        !loading &&
                        !isActionDisabled() &&
                        viewMode !== "archived"
                      ) {
                        e.target.style.backgroundColor =
                          "rgba(255, 193, 7, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        !loading &&
                        !isActionDisabled() &&
                        viewMode !== "archived"
                      ) {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <i className="fas fa-archive me-2"></i>
                    Archived
                    <span
                      className="badge ms-2"
                      style={{
                        backgroundColor:
                          viewMode === "archived"
                            ? "rgba(255,255,255,0.9)"
                            : "#ffc107",
                        color: viewMode === "archived" ? "#856404" : "white",
                      }}
                    >
                      {incidents.filter((i) => i.status === "Archived").length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`btn fw-semibold ${
                      viewMode === "all"
                        ? "text-white"
                        : "btn-outline-secondary text-secondary"
                    }`}
                    onClick={() => setViewMode("all")}
                    disabled={loading || isActionDisabled()}
                    style={{
                      backgroundColor:
                        viewMode === "all" ? "#6c757d" : "transparent",
                      borderColor: "#6c757d",
                      borderWidth: "2px",
                      minWidth: "80px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (
                        !loading &&
                        !isActionDisabled() &&
                        viewMode !== "all"
                      ) {
                        e.target.style.backgroundColor =
                          "rgba(108, 117, 125, 0.1)";
                        e.target.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        !loading &&
                        !isActionDisabled() &&
                        viewMode !== "all"
                      ) {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <i className="fas fa-layer-group me-2"></i>
                    All
                    <span
                      className="badge ms-2"
                      style={{
                        backgroundColor:
                          viewMode === "all"
                            ? "rgba(255,255,255,0.9)"
                            : "#6c757d",
                        color: viewMode === "all" ? "#495057" : "white",
                      }}
                    >
                      {incidents.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="d-flex justify-content-start justify-content-md-end">
                <div className="text-center text-md-end">
                  {viewMode === "active" && (
                    <div className="d-flex align-items-center justify-content-center justify-content-md-end text-success fw-semibold small">
                      <i className="fas fa-info-circle me-2"></i>
                      <span>Showing active incidents only</span>
                    </div>
                  )}
                  {viewMode === "archived" && (
                    <div className="d-flex align-items-center justify-content-center justify-content-md-end text-warning fw-semibold small">
                      <i className="fas fa-info-circle me-2"></i>
                      <span>Showing archived incidents only</span>
                    </div>
                  )}
                  {viewMode === "all" && (
                    <div className="d-flex align-items-center justify-content-center justify-content-md-end text-info fw-semibold small">
                      <i className="fas fa-info-circle me-2"></i>
                      <span>Showing all incidents including archived</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 g-md-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold mb-1">
                Search Incidents
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by title, location, description..."
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

            {/* TYPE FILTER */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Type</label>
              <select
                className="form-select form-select-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={loading || isActionDisabled()}
              >
                <option value="all">All Types</option>
                {getUniqueValues("incident_type").map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* SEVERITY FILTER */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">
                Severity
              </label>
              <select
                className="form-select form-select-sm"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                disabled={loading || isActionDisabled()}
              >
                <option value="all">All Severity</option>
                {getUniqueValues("severity").map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS FILTER - DISABLED IN ARCHIVED VIEW MODE */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">
                Status
                {viewMode === "archived" && (
                  <span
                    className="text-muted ms-1"
                    title="Status filter disabled in archived view"
                  >
                    <i className="fas fa-info-circle"></i>
                  </span>
                )}
              </label>
              <select
                className="form-select form-select-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={
                  loading || isActionDisabled() || viewMode === "archived"
                }
                style={{
                  opacity: viewMode === "archived" ? 0.6 : 1,
                  cursor: viewMode === "archived" ? "not-allowed" : "pointer",
                  backgroundColor:
                    viewMode === "archived" ? "#f8f9fa" : "white",
                }}
              >
                <option value="all">All Status</option>
                {getUniqueValues("status")
                  .filter((status) => status !== "Archived")
                  .map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Items</label>
              <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                disabled={loading || isActionDisabled()}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Card */}
      <div className="card shadow border-0">
        <div
          className="card-header py-3"
          style={{
            backgroundColor: "var(--primary-color)",
            background:
              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
          }}
        >
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
            <h6 className="card-title mb-0 text-white">
              <i className="fas fa-list me-2"></i>
              Incident Reports
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredIncidents.length} found
                  {searchTerm ||
                  filterType !== "all" ||
                  filterSeverity !== "all" ||
                  filterStatus !== "all"
                    ? " after filtering"
                    : ""}
                  )
                </small>
              )}
            </h6>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={refreshAllData}
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
              <table className="table table-striped table-hover mb-0 table-fixed-layout">
                <thead style={{ backgroundColor: "var(--background-light)" }}>
                  <tr>
                    <th
                      className="text-center fw-bold"
                      style={{ width: "50px", fontSize: "0.875rem" }}
                    >
                      #
                    </th>
                    <th
                      className="text-center"
                      style={{ width: "100px", fontSize: "0.875rem" }}
                    >
                      Actions
                    </th>
                    <th style={{ width: "250px", fontSize: "0.875rem" }}>
                      Incident Details
                    </th>
                    <th style={{ width: "120px", fontSize: "0.875rem" }}>
                      Type
                    </th>
                    <th style={{ width: "100px", fontSize: "0.875rem" }}>
                      Severity
                    </th>
                    <th style={{ width: "120px", fontSize: "0.875rem" }}>
                      Status
                    </th>
                    <th style={{ width: "200px", fontSize: "0.875rem" }}>
                      Location
                    </th>
                    <th
                      className="text-center"
                      style={{ width: "130px", fontSize: "0.875rem" }}
                    >
                      Incident Date
                    </th>
                    <th
                      className="text-center"
                      style={{ width: "130px", fontSize: "0.875rem" }}
                    >
                      Reported
                    </th>
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
                <span className="text-muted">Fetching incident data...</span>
              </div>
            </div>
          ) : currentIncidents.length === 0 ? (
            // Empty state
            <div className="text-center py-5">
              <div className="mb-4">
                {viewMode === "archived" ? (
                  <i className="fas fa-archive fa-4x text-muted opacity-50"></i>
                ) : (
                  <i className="fas fa-search fa-4x text-muted opacity-50"></i>
                )}
              </div>
              <h5 className="text-muted mb-3">
                {incidents.length === 0
                  ? "No Incidents Reported"
                  : viewMode === "archived"
                  ? "No Archived Incidents"
                  : viewMode === "active"
                  ? "No Active Incidents"
                  : "No Matching Results"}
              </h5>
              <p className="text-muted mb-4">
                {incidents.length === 0
                  ? "Start by reporting your first incident."
                  : viewMode === "archived"
                  ? "There are no archived incidents matching your criteria."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {incidents.length === 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowReportModal(true)}
                  disabled={isActionDisabled()}
                  style={{
                    backgroundColor: "var(--btn-primary-bg)",
                    borderColor: "var(--btn-primary-bg)",
                  }}
                >
                  <i className="fas fa-plus me-2"></i>Report First Incident
                </button>
              )}
              {(searchTerm ||
                filterType !== "all" ||
                filterSeverity !== "all" ||
                filterStatus !== "all") && (
                <button
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterSeverity("all");
                    setFilterStatus("all");
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
                      <th
                        className="text-center fw-bold"
                        style={{ width: "50px", fontSize: "0.875rem" }}
                      >
                        #
                      </th>
                      <th
                        className="text-center"
                        style={{ width: "100px", fontSize: "0.875rem" }}
                      >
                        Actions
                      </th>
                      <th style={{ fontSize: "0.875rem" }}>
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                          onClick={() => handleSort("title")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.875rem" }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Incident Details
                            <i className={`ms-1 ${getSortIcon("title")}`}></i>
                          </span>
                        </button>
                      </th>
                      <th style={{ fontSize: "0.875rem" }}>
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                          onClick={() => handleSort("incident_type")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.875rem" }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Type
                            <i
                              className={`ms-1 ${getSortIcon("incident_type")}`}
                            ></i>
                          </span>
                        </button>
                      </th>
                      <th style={{ fontSize: "0.875rem" }}>
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                          onClick={() => handleSort("severity")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.875rem" }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Severity
                            <i
                              className={`ms-1 ${getSortIcon("severity")}`}
                            ></i>
                          </span>
                        </button>
                      </th>
                      <th style={{ fontSize: "0.875rem" }}>
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                          onClick={() => handleSort("status")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.875rem" }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Status
                            <i className={`ms-1 ${getSortIcon("status")}`}></i>
                          </span>
                        </button>
                      </th>
                      <th style={{ fontSize: "0.875rem" }}>
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                          onClick={() => handleSort("location")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.875rem" }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Location
                            <i
                              className={`ms-1 ${getSortIcon("location")}`}
                            ></i>
                          </span>
                        </button>
                      </th>
                      <th
                        className="text-center"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold"
                          onClick={() => handleSort("incident_date")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.9rem" }}
                        >
                          <span className="d-flex align-items-center">
                            Incident Date
                            <i
                              className={`ms-1 ${getSortIcon("incident_date")}`}
                            ></i>
                          </span>
                        </button>
                      </th>
                      <th
                        className="text-center"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold"
                          onClick={() => handleSort("created_at")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.9rem" }}
                        >
                          <span className="d-flex align-items-center">
                            Reported
                            <i
                              className={`ms-1 ${getSortIcon("created_at")}`}
                            ></i>
                          </span>
                        </button>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentIncidents.map((incident, index) => (
                      <tr
                        key={incident.id}
                        className="align-middle"
                        style={{ height: "70px" }}
                      >
                        <td
                          className="text-center fw-bold text-muted"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {startIndex + index + 1}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            {/* View Button */}
                            <button
                              className="btn action-btn btn-view"
                              onClick={() => handleView(incident)}
                              disabled={isActionDisabled(incident.id)}
                              title="View Details"
                            >
                              {actionLoading === incident.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-eye"></i>
                              )}
                            </button>

                            {/* Edit Button */}
                            <button
                              className="btn action-btn btn-approve"
                              onClick={() => handleEditWithAlert(incident)}
                              disabled={isActionDisabled(incident.id)}
                              title={getEditButtonTitle(incident)}
                            >
                              {actionLoading === incident.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-edit"></i>
                              )}
                            </button>

                            {/* UPDATED: Population Data Button - Matching existing pattern */}
                            <button
                              className="btn action-btn"
                              onClick={() => handleAddPopulationData(incident)}
                              disabled={isActionDisabled(incident.id)}
                              title="Add Population Data"
                              style={{
                                backgroundColor: "#17a2b8",
                                borderColor: "#17a2b8",
                                color: "white",
                                width: "32px",
                                height: "32px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.875rem",
                                padding: "0",
                                border: "1px solid",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) => {
                                if (!isActionDisabled(incident.id)) {
                                  e.target.style.backgroundColor = "#138496";
                                  e.target.style.borderColor = "#138496";
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 2px 8px rgba(23, 162, 184, 0.3)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActionDisabled(incident.id)) {
                                  e.target.style.backgroundColor = "#17a2b8";
                                  e.target.style.borderColor = "#17a2b8";
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "none";
                                }
                              }}
                            >
                              {actionLoading === incident.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-users"></i>
                              )}
                            </button>

                            {/* UPDATED: Infrastructure Status Button - Matching existing pattern */}
                            <button
                              className="btn action-btn"
                              onClick={() =>
                                handleAddInfrastructureData(incident)
                              }
                              disabled={isActionDisabled(incident.id)}
                              title="Add Infrastructure Status"
                              style={{
                                backgroundColor: "#ffc107",
                                borderColor: "#ffc107",
                                color: "white",
                                width: "32px",
                                height: "32px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.875rem",
                                padding: "0",
                                border: "1px solid",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) => {
                                if (!isActionDisabled(incident.id)) {
                                  e.target.style.backgroundColor = "#e0a800";
                                  e.target.style.borderColor = "#e0a800";
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 2px 8px rgba(255, 193, 7, 0.3)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActionDisabled(incident.id)) {
                                  e.target.style.backgroundColor = "#ffc107";
                                  e.target.style.borderColor = "#ffc107";
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "none";
                                }
                              }}
                            >
                              {actionLoading === incident.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-road"></i>
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              className="btn action-btn btn-reject"
                              onClick={() => handleDeleteWithAlert(incident)}
                              disabled={isActionDisabled(incident.id)}
                              title={getDeleteButtonTitle(incident)}
                            >
                              {actionLoading === incident.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-trash"></i>
                              )}
                            </button>
                          </div>
                        </td>

{/* Incident Details - Clean version without badges */}
<td style={{ maxWidth: "250px", minWidth: "250px" }}>
  <div className="d-flex align-items-center">
    <div className="position-relative me-3 flex-shrink-0">
      <div
        className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "40px", height: "40px" }}
      >
        <i
          className={`fas ${getTypeIcon(
            incident.incident_type
          )} text-white`}
        ></i>
      </div>
    </div>
    <div className="flex-grow-1 min-w-0">
      {/* Title */}
      <div
        className="fw-semibold text-dark text-truncate"
        style={{ fontSize: "0.9rem", lineHeight: "1.3" }}
        title={incident.title}
      >
        {incident.title}
      </div>
      
      {/* Description */}
      <small
        className="text-muted d-block text-truncate"
        style={{ fontSize: "0.8rem", lineHeight: "1.3" }}
        title={incident.description || "No description"}
      >
        {incident.description
          ? incident.description.length > 80
            ? `${incident.description.substring(0, 80)}...`
            : incident.description
          : "No description"}
      </small>
    </div>
  </div>
</td>

                        {/* Type - Fixed width */}
                        <td style={{ width: "120px" }}>
                          <span
                            className="badge bg-light text-dark border"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className={`fas ${getTypeIcon(
                                incident.incident_type
                              )} me-1`}
                            ></i>
                            {incident.incident_type}
                          </span>
                        </td>

                        {/* Severity - Fixed width */}
                        <td style={{ width: "100px" }}>
                          <span
                            className={`badge ${getSeverityBadge(
                              incident.severity
                            )}`}
                            style={{ fontSize: "0.8rem" }}
                          >
                            {incident.severity}
                          </span>
                        </td>

                        {/* Status - Fixed width */}
                        <td style={{ width: "120px" }}>
                          <span
                            className={`badge ${getStatusBadge(
                              incident.status
                            )}`}
                            style={{ fontSize: "0.8rem" }}
                          >
                            {incident.status}
                          </span>
                        </td>

                        {/* Location - Fixed width with truncation */}
                        <td style={{ maxWidth: "200px", minWidth: "200px" }}>
                          <div
                            className="fw-semibold text-dark text-truncate"
                            style={{ fontSize: "0.9rem" }}
                            title={incident.location} // Tooltip for full location
                          >
                            {incident.location}
                          </div>
                        </td>

                        {/* Incident Date - Fixed width */}
                        <td className="text-center" style={{ width: "130px" }}>
                          <div
                            className="fw-semibold text-dark"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {formatLocalDate(incident.incident_date)}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {formatLocalTime(incident.incident_date)}
                          </div>
                        </td>

                        {/* Reported - Fixed width */}
                        <td className="text-center" style={{ width: "130px" }}>
                          <div
                            className="fw-semibold text-dark"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {formatLocalDate(incident.created_at)}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {formatLocalTime(incident.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                          {Math.min(endIndex, filteredIncidents.length)}
                        </span>{" "}
                        of{" "}
                        <span className="fw-semibold">
                          {filteredIncidents.length}
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
      {/* Modals */}
      {showReportModal && (
        <IncidentReportModal
          onClose={() => setShowReportModal(false)}
          onSuccess={handleReportSuccess}
        />
      )}
      {showViewModal && selectedIncident && (
        <IncidentViewModal
          incident={selectedIncident}
          onClose={() => {
            setShowViewModal(false);
            setSelectedIncident(null);
          }}
        />
      )}
      {showEditModal && selectedIncident && (
        <IncidentEditModal
          incident={selectedIncident}
          onClose={() => {
            setShowEditModal(false);
            setSelectedIncident(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Add to your existing modals section */}
      {showPopulationModal && selectedIncident && (
        <PopulationDataModal
          incident={selectedIncident}
          onClose={() => {
            setShowPopulationModal(false);
            setSelectedIncident(null);
          }}
          onSuccess={() => {
            setShowPopulationModal(false);
            setSelectedIncident(null);
            showToast.success("Population data saved successfully!");
            refreshAllData(); // Refresh to show updated data
          }}
        />
      )}

      {showInfrastructureModal && selectedIncident && (
        <InfrastructureStatusModal
          incident={selectedIncident}
          onClose={() => {
            setShowInfrastructureModal(false);
            setSelectedIncident(null);
          }}
          onSuccess={() => {
            setShowInfrastructureModal(false);
            setSelectedIncident(null);
            showToast.success("Infrastructure status saved successfully!");
            refreshAllData(); // Refresh to show updated data
          }}
        />
      )}
    </div>
  );
};

export default IncidentList;
