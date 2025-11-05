// pages/admin/IncidentManagement.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showAlert, showToast } from "../../../services/notificationService";
import IncidentDetailsModal from "./IncidentDetailsModal";
import IncidentStatusModal from "./IncidentStatusModal";
import ArchiveModal from "./ArchiveModal";
import UnarchiveModal from "./UnarchiveModal";
import PopulationDataModal from "../../admin_barangay/PopulationDataModal";
import InfrastructureStatusModal from "../../admin_barangay/InfrastructureStatusModal";

const AdminIncidentManagement = () => {
  const { user, token } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBarangay, setFilterBarangay] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // Add to your existing states
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [viewMode, setViewMode] = useState("active"); // "active", "archived", "all"

  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);

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
  }, []);

  useEffect(() => {
    if (incidents.length > 0) {
      fetchStats();
    }
  }, [incidents]); // Add this useEffect to calculate stats when incidents change

  // Update your useEffect for filtering
  useEffect(() => {
    filterAndSortIncidents();
  }, [
    incidents,
    searchTerm,
    filterType,
    filterSeverity,
    filterStatus,
    filterBarangay,
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

  // Add these functions near your other handler functions
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
  } catch (error) {
    console.error("Error opening infrastructure modal:", error);
    showToast.error("Failed to open infrastructure status form");
  } finally {
    setActionLoading(null);
    setActionLock(false);
  }
};

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/incidents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents || []);
      } else {
        throw new Error("Failed to fetch incidents");
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      showAlert.error("Error", "Failed to load incidents");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from incidents data (like your original code)
      const statsData = {
        total: incidents.length,
        reported: incidents.filter((i) => i.status === "Reported").length,
        investigating: incidents.filter((i) => i.status === "Investigating")
          .length,
        resolved: incidents.filter((i) => i.status === "Resolved").length,
        high_critical: incidents.filter((i) =>
          ["High", "Critical"].includes(i.severity)
        ).length,
      };
      setStats(statsData);
    } catch (error) {
      console.error("Error calculating stats:", error);
      // Fallback to empty stats
      setStats({
        total: 0,
        reported: 0,
        investigating: 0,
        resolved: 0,
        high_critical: 0,
      });
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

  const handleUnarchiveIncident = async (
    incidentId,
    unarchiveReason,
    newStatus
  ) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    setActionLock(true);
    setActionLoading(incidentId);

    try {


      const response = await fetch(
        `${
          import.meta.env.VITE_LARAVEL_API
        }/admin/incidents/${incidentId}/unarchive`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            unarchive_reason: unarchiveReason,
            new_status: newStatus,
            // Try alternative field names if validation fails
            reason: unarchiveReason,
            status: newStatus,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        showToast.success("Incident unarchived successfully");

        // Close the processing alert
        showAlert.close();

        // Update local state
        setIncidents((prev) =>
          prev.map((incident) =>
            incident.id === incidentId
              ? {
                  ...incident,
                  status: newStatus,
                  archive_reason: null,
                  archived_at: null,
                  archived_by: null,
                }
              : incident
          )
        );

        setShowUnarchiveModal(false);
        setSelectedIncident(null);
        await fetchStats();
      } else {
        // Close the processing alert on error
        showAlert.close();

        // More detailed error message
        const errorMessage =
          responseData.message || responseData.errors
            ? Object.values(responseData.errors).flat().join(", ")
            : "Failed to unarchive incident";

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error unarchiving incident:", error);
      // Close the processing alert on error
      showAlert.close();
      showAlert.error(
        "Unarchive Failed",
        error.message || "Failed to unarchive incident. Please try again."
      );
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleUnarchiveClick = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedIncident(incident);
    setShowUnarchiveModal(true);
  };

  // New function to handle status update with alert for archived incidents
  const handleStatusUpdateWithAlert = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    if (incident.status === "Archived") {
      showAlert.info(
        "Cannot Update Status",
        "This incident is currently archived and cannot have its status updated. Please unarchive the incident first to modify its status.",
        "Okay"
      );
      return;
    }

    setSelectedIncident(incident);
    setShowStatusModal(true);
  };

  // Replace your existing filterAndSortIncidents function with this:
  const filterAndSortIncidents = () => {
    let filtered = [...incidents];



// When opening PopulationDataModal
const handleAddPopulationData = async (incident) => {
  try {
    // Fetch existing data if any
    const response = await fetch(`/api/incidents/${incident.id}/population-data`);
    if (response.ok) {
      const { data } = await response.json();
      if (data) {
        // Pre-fill form with existing data
        setFormData(data);
        setIsEditing(true);
      }
    }
    setShowPopulationModal(true);
  } catch (error) {
    showToast.error('Failed to load population data');
  }
};

const handleAddInfrastructureData = (incident) => {
  if (actionLock) {
    showToast.warning("Please wait until the current action completes");
    return;
  }
  setSelectedIncident(incident);
  setShowInfrastructureModal(true);
};

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
            .includes(searchTerm.toLowerCase()) ||
          incident.reporter?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          incident.reporter?.barangay_name
            ?.toLowerCase()
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

    // Status filter - UPDATED: Apply in all view modes (like IncidentList)
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (incident) => incident.status === filterStatus
      );
    }

    // Barangay filter
    if (filterBarangay !== "all") {
      filtered = filtered.filter(
        (incident) => incident.reporter?.barangay_name === filterBarangay
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (
        sortField === "created_at" ||
        sortField === "incident_date" ||
        sortField === "archived_at"
      ) {
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

  const updateIncidentStatus = async (
    incidentId,
    newStatus,
    adminNotes = ""
  ) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    setActionLock(true);
    setActionLoading(incidentId);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_LARAVEL_API
        }/admin/incidents/${incidentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            admin_notes: adminNotes,
          }),
        }
      );

      if (response.ok) {
        showToast.success(`Incident status updated to ${newStatus}`);

        // Close the processing alert
        showAlert.close();

        // Update local state
        setIncidents((prev) =>
          prev.map((incident) =>
            incident.id === incidentId
              ? { ...incident, status: newStatus, admin_notes: adminNotes }
              : incident
          )
        );

        setShowStatusModal(false);
        setSelectedIncident(null);
        await fetchStats();
      } else {
        const errorData = await response.json();
        // Close the processing alert on error
        showAlert.close();
        throw new Error(
          errorData.message || "Failed to update incident status"
        );
      }
    } catch (error) {
      console.error("Error updating incident status:", error);
      // Close the processing alert on error
      showAlert.close();
      showAlert.error(
        "Update Failed",
        error.message || "Failed to update incident status. Please try again."
      );
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleViewDetails = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedIncident(incident);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedIncident(incident);
    setShowStatusModal(true);
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

  // Update getStatusBadge function
  const getStatusBadge = (status) => {
    const statusStyles = {
      Reported: "bg-primary text-white",
      Investigating: "bg-info text-white",
      Resolved: "bg-success text-white",
      Archived: "bg-secondary text-white",
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

  const getUniqueBarangays = () => {
    const barangays = [
      ...new Set(
        incidents
          .map((incident) => incident.reporter?.barangay_name)
          .filter(Boolean)
      ),
    ];
    return barangays.sort();
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

  // Skeleton Loaders - CORRECTED VERSION (NO incident references)
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

  const handleArchiveIncident = async (incidentId, archiveReason) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    setActionLock(true);
    setActionLoading(incidentId);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_LARAVEL_API
        }/admin/incidents/${incidentId}/archive`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            archive_reason: archiveReason,
          }),
        }
      );

      if (response.ok) {
        showToast.success("Incident archived successfully");

        // Close the processing alert
        showAlert.close();

        // Update local state
        setIncidents((prev) =>
          prev.map((incident) =>
            incident.id === incidentId
              ? {
                  ...incident,
                  status: "Archived",
                  archive_reason: archiveReason,
                  archived_at: new Date().toISOString(),
                }
              : incident
          )
        );

        setShowArchiveModal(false);
        setSelectedIncident(null);
        await fetchStats();
      } else {
        const errorData = await response.json();
        // Close the processing alert on error
        showAlert.close();
        throw new Error(errorData.message || "Failed to archive incident");
      }
    } catch (error) {
      console.error("Error archiving incident:", error);
      // Close the processing alert on error
      showAlert.close();
      showAlert.error(
        "Archive Failed",
        error.message || "Failed to archive incident. Please try again."
      );
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleArchiveClick = (incident) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }
    setSelectedIncident(incident);
    setShowArchiveModal(true);
  };

  return (
    <div className="container-fluid px-1">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1 text-dark">Incident Management</h1>
          <p className="text-muted mb-0">
            Review and manage incidents reported by barangays
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
            onClick={refreshAllData}
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
            <div className="col-12 col-md-3">
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
                  placeholder="Search by title, location, barangay..."
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

            {/* TYPE FILTER - FIXED */}
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
              {viewMode === "archived" && (
                <small
                  className="text-muted d-block mt-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  <i className="fas fa-info-circle me-1"></i>
                  Status filter disabled in archived view
                </small>
              )}
            </div>

            {/* BARANGAY FILTER */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">
                Barangay
              </label>
              <select
                className="form-select form-select-sm"
                value={filterBarangay}
                onChange={(e) => setFilterBarangay(e.target.value)}
                disabled={loading || isActionDisabled()}
              >
                <option value="all">All Barangays</option>
                {getUniqueBarangays().map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
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
                  filterStatus !== "all" ||
                  filterBarangay !== "all"
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
                      style={{ width: "80px", fontSize: "0.875rem" }}
                    >
                      Actions
                    </th>
                    <th style={{ width: "250px", fontSize: "0.875rem" }}>
                      Incident Details
                    </th>
                    <th style={{ width: "150px", fontSize: "0.875rem" }}>
                      Barangay & Reporter
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
                  ? ""
                  : viewMode === "archived"
                  ? "There are no archived incidents matching your criteria."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {(searchTerm ||
                filterType !== "all" ||
                filterSeverity !== "all" ||
                filterStatus !== "all" ||
                filterBarangay !== "all") && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterSeverity("all");
                    setFilterStatus("all");
                    setFilterBarangay("all");
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
                        style={{ width: "80px", fontSize: "0.875rem" }}
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
                          onClick={() => handleSort("reporter.barangay_name")}
                          disabled={isActionDisabled()}
                          style={{ fontSize: "0.875rem" }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Barangay & Reporter
                            <i
                              className={`ms-1 ${getSortIcon(
                                "reporter.barangay_name"
                              )}`}
                            ></i>
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
    {/* Existing View Button */}
    <button
      className="btn action-btn btn-view"
      onClick={() => handleViewDetails(incident)}
      disabled={isActionDisabled(incident.id)}
      title="View Details"
    >
      {actionLoading === incident.id ? (
        <span className="spinner-border spinner-border-sm" role="status"></span>
      ) : (
        <i className="fas fa-eye"></i>
      )}
    </button>

    {/* Existing Status Update Button */}
    <button
      className="btn action-btn btn-approve"
      onClick={() => handleStatusUpdateWithAlert(incident)}
      disabled={isActionDisabled(incident.id)}
      title="Update Status"
    >
      {actionLoading === incident.id ? (
        <span className="spinner-border spinner-border-sm" role="status"></span>
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
    transition: "all 0.2s ease-in-out"
  }}
  onMouseEnter={(e) => {
    if (!isActionDisabled(incident.id)) {
      e.target.style.backgroundColor = "#138496";
      e.target.style.borderColor = "#138496";
      e.target.style.transform = "translateY(-1px)";
      e.target.style.boxShadow = "0 2px 8px rgba(23, 162, 184, 0.3)";
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
    <span className="spinner-border spinner-border-sm" role="status"></span>
  ) : (
    <i className="fas fa-users"></i>
  )}
</button>

{/* UPDATED: Infrastructure Status Button - Matching existing pattern */}
<button
  className="btn action-btn"
  onClick={() => handleAddInfrastructureData(incident)}
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
    transition: "all 0.2s ease-in-out"
  }}
  onMouseEnter={(e) => {
    if (!isActionDisabled(incident.id)) {
      e.target.style.backgroundColor = "#e0a800";
      e.target.style.borderColor = "#e0a800";
      e.target.style.transform = "translateY(-1px)";
      e.target.style.boxShadow = "0 2px 8px rgba(255, 193, 7, 0.3)";
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
    <span className="spinner-border spinner-border-sm" role="status"></span>
  ) : (
    <i className="fas fa-road"></i>
  )}
</button>

    {/* Archive Button - Only for non-archived incidents */}
    {incident.status !== "Archived" && (
      <button
        className="btn action-btn btn-reject"
        onClick={() => handleArchiveClick(incident)}
        disabled={isActionDisabled(incident.id)}
        title="Archive Incident"
      >
        {actionLoading === incident.id ? (
          <span className="spinner-border spinner-border-sm" role="status"></span>
        ) : (
          <i className="fas fa-archive"></i>
        )}
      </button>
    )}

    {/* Unarchive Button - Only for archived incidents */}
    {incident.status === "Archived" && (
      <button
        className="btn action-btn btn-approve"
        onClick={() => handleUnarchiveClick(incident)}
        disabled={isActionDisabled(incident.id)}
        title="Unarchive Incident"
      >
        {actionLoading === incident.id ? (
          <span className="spinner-border spinner-border-sm" role="status"></span>
        ) : (
          <i className="fas fa-box-open"></i>
        )}
      </button>
    )}
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

                        {/* Barangay & Reporter */}
                        <td style={{ maxWidth: "150px", minWidth: "150px" }}>
                          <div
                            className="fw-semibold text-dark text-truncate"
                            style={{ fontSize: "0.9rem" }}
                            title={incident.reporter?.barangay_name || "N/A"}
                          >
                            {incident.reporter?.barangay_name || "N/A"}
                          </div>
                          <small
                            className="text-muted d-block text-truncate"
                            style={{ fontSize: "0.8rem" }}
                            title={incident.reporter?.name || "N/A"}
                          >
                            {incident.reporter?.name || "N/A"}
                          </small>
                        </td>

                        {/* Type */}
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

                        {/* Severity */}
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

                        {/* Status */}
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

                        {/* Location */}
                        <td style={{ maxWidth: "200px", minWidth: "200px" }}>
                          <div
                            className="fw-semibold text-dark text-truncate"
                            style={{ fontSize: "0.9rem" }}
                            title={incident.location}
                          >
                            {incident.location}
                          </div>
                        </td>

                        {/* Incident Date */}
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

                        {/* Reported */}
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
      {showDetailsModal && selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedIncident(null);
          }}
        />
      )}

      {showStatusModal && selectedIncident && (
        <IncidentStatusModal
          incident={selectedIncident}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedIncident(null);
          }}
          onStatusUpdate={updateIncidentStatus}
          loading={actionLoading === selectedIncident.id}
        />
      )}

      {/* Add to your existing modals section */}
      {showArchiveModal && selectedIncident && (
        <ArchiveModal
          incident={selectedIncident}
          onClose={() => {
            setShowArchiveModal(false);
            setSelectedIncident(null);
          }}
          onArchive={handleArchiveIncident}
          loading={actionLoading === selectedIncident.id}
        />
      )}

      {/* Add to your existing modals section */}
      {showUnarchiveModal && selectedIncident && (
        <UnarchiveModal
          incident={selectedIncident}
          onClose={() => {
            setShowUnarchiveModal(false);
            setSelectedIncident(null);
          }}
          onUnarchive={handleUnarchiveIncident}
          loading={actionLoading === selectedIncident.id}
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

export default AdminIncidentManagement;
