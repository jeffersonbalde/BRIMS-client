// components/admin/Approvals.jsx - ENHANCED WITH ACTION LOCK
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  showAlert,
  showToast,
  showRejectionModal,
} from "../../services/notificationService";
import Swal from "sweetalert2";

const Approvals = () => {
  const { user, token, refreshPendingApprovals } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false); // New: Global action lock

  // New state for rejection reason
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    rejectionReason: "",
    error: "",
  });

  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMunicipality, setFilterMunicipality] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [pendingUsers, searchTerm, filterMunicipality, sortField, sortDirection]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/pending-users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.users || []);
      } else {
        throw new Error("Failed to fetch pending users");
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
      showAlert.error("Error", "Failed to load pending users");
      setPendingUsers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (actionLock) {
      showToast.warning("Please wait until current action completes");
      return;
    }
    await fetchPendingUsers();
    showToast.info("Data refreshed successfully");
  };

  const filterAndSortUsers = () => {
    let filtered = [...pendingUsers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.barangay_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.contact.includes(searchTerm)
      );
    }

    // Apply municipality filter
    if (filterMunicipality !== "all") {
      filtered = filtered.filter(
        (user) => user.municipality === filterMunicipality
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (field) => {
    if (actionLock) return; // Prevent sorting during actions
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Add this helper function
  const formatAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;

    // If it's already a full URL, return as is
    if (avatarPath.startsWith("http")) return avatarPath;

    // If it's a storage path, convert to URL
    if (avatarPath.includes("avatars/")) {
      const filename = avatarPath.split("/").pop();
      return `${import.meta.env.VITE_LARAVEL_API}/avatar/${filename}`;
    }

    return avatarPath;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleApprove = async (userId) => {
    // Check if any action is already in progress
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    // Show confirmation dialog
    const result = await showAlert.confirm(
      "Approve User",
      "Are you sure you want to approve this user? This action will grant them full access to the system.",
      "Yes, Approve",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return; // User cancelled the action
    }

    // Set global and specific loading states
    setActionLock(true);
    setActionLoading(userId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users/${userId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Show success message
        showToast.success("User approved successfully!");

        // Update the pending users list by removing the approved user
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

        // Refresh the pending approvals count in sidebar
        await refreshPendingApprovals();

        // Refresh the data to update stats
        await fetchPendingUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      showAlert.error(
        "Approval Failed",
        error.message || "Failed to approve user. Please try again."
      );
    } finally {
      // Clear loading states
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const openRejectionModal = async (userId, userName) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    try {
      const { value: rejectionReason } = await Swal.fire({
        title:
          '<h5 class="modal-title" style="margin: 0; color: var(--text-primary); font-weight: 600; font-size: 1.25rem;">Reject User</h5>',
        html: `
        <div style="text-align: left;">
          <p style="margin: 0 0 1rem 0; color: var(--text-primary); line-height: 1.5; font-size: 0.875rem;">
            You are about to reject <strong>${userName}</strong>. Please provide a reason for rejection (minimum 10 characters).
          </p>
          <div class="mb-3">
            <label for="rejectionReason" class="form-label" style="color: var(--text-primary); font-weight: 500; margin-bottom: 0.5rem;">
              Rejection Reason <span class="text-danger">*</span>
            </label>
            <textarea
              id="rejectionReason"
              class="form-control"
              rows="4"
              placeholder="Please provide a detailed reason for rejection..."
              style="
                width: 100%;
                background-color: var(--input-bg);
                border: 1px solid var(--input-border);
                color: var(--input-text);
                border-radius: 0.375rem;
                padding: 0.5rem;
                font-size: 0.875rem;
                resize: vertical;
                font-family: inherit;
              "
            ></textarea>
            <div class="form-text" style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.5rem;">
              Minimum 10 characters. This reason will be stored and may be used for communication with the user.
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
            <small style="color: var(--text-muted); font-size: 0.75rem;" id="charCount">0/10 characters</small>
            <small style="color: var(--text-muted); font-size: 0.75rem;" id="validationMessage"></small>
          </div>
        </div>
      `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Confirm Rejection",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        width: "500px",
        customClass: {
          popup: "swal2-rejection-popup",
          title: "swal2-rejection-title",
          htmlContainer: "swal2-rejection-html",
          actions: "swal2-rejection-actions",
          confirmButton: "swal2-rejection-confirm",
          cancelButton: "swal2-rejection-cancel",
        },
        preConfirm: () => {
          const textarea = document.getElementById("rejectionReason");
          const reason = textarea.value.trim();

          if (!reason || reason.length < 10) {
            Swal.showValidationMessage(
              "Please provide a rejection reason with at least 10 characters"
            );
            return false;
          }
          return reason;
        },
        didOpen: () => {
          const textarea = document.getElementById("rejectionReason");
          const charCount = document.getElementById("charCount");
          const validationMessage =
            document.getElementById("validationMessage");

          textarea.addEventListener("input", function () {
            const text = this.value.trim();
            charCount.textContent = `${text.length}/10 characters`;

            if (text.length < 10 && text.length > 0) {
              validationMessage.textContent = "Minimum 10 characters required";
              validationMessage.style.color = "#dc3545";
            } else if (text.length >= 10) {
              validationMessage.textContent = "Valid reason";
              validationMessage.style.color = "#28a745";
            } else {
              validationMessage.textContent = "";
              validationMessage.style.color = "var(--text-muted)";
            }
          });

          textarea.focus();
        },
      });

      if (!rejectionReason) {
        return; // User cancelled
      }

      // Set loading state
      setActionLock(true);
      setActionLoading(userId);

      // Send rejection request
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users/${userId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejection_reason: rejectionReason,
          }),
        }
      );

      if (response.ok) {
        showToast.info("User rejected successfully");
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

        // Refresh the pending approvals count in sidebar
        await refreshPendingApprovals();

        // Refresh data to update stats
        await fetchPendingUsers();
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessage = Object.values(errorData.errors)
            .flat()
            .join(", ");
          throw new Error(errorMessage);
        }
        throw new Error(errorData.message || "Failed to reject user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      showAlert.error(
        "Rejection Failed",
        error.message || "Failed to reject user"
      );
    } finally {
      // Clear loading states
      setActionLoading(null);
      setActionLock(false);
    }
  };

  // NEW: Close rejection modal
  const closeRejectionModal = () => {
    setRejectionModal({
      isOpen: false,
      userId: null,
      userName: "",
      rejectionReason: "",
    });
  };

  // NEW: Handle rejection with reason
  const handleRejectWithReason = async () => {
    const { userId, rejectionReason } = rejectionModal;

    if (!rejectionReason.trim()) {
      showToast.error("Please provide a rejection reason");
      return;
    }

    if (rejectionReason.trim().length < 10) {
      showToast.error("Rejection reason must be at least 10 characters long");
      return;
    }

    // Set global and specific loading states
    setActionLock(true);
    setActionLoading(userId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/admin/users/${userId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejection_reason: rejectionReason.trim(),
          }),
        }
      );

      if (response.ok) {
        showToast.info("User rejected successfully");
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
        closeRejectionModal();

        // Refresh data to update stats
        await fetchPendingUsers();
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          // Handle validation errors
          const errorMessage = Object.values(errorData.errors)
            .flat()
            .join(", ");
          throw new Error(errorMessage);
        }
        throw new Error(errorData.message || "Failed to reject user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      showAlert.error(
        "Rejection Failed",
        error.message || "Failed to reject user"
      );
    } finally {
      // Clear loading states
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleReject = async (userId, userName) => {
    // Check if any action is already in progress
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    // Open the custom rejection modal instead of using SweetAlert2
    openRejectionModal(userId, userName);
  };
  const handleViewDetails = (user) => {
    // Prevent viewing details during actions to avoid confusion
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const userAvatar = formatAvatarUrl(user.avatar);

    const detailsHTML = `
      <div style="max-width: 400px; margin: 0 auto;">
        <!-- Avatar Section - SIMPLIFIED -->
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="display: inline-block; position: relative;">
            ${
              userAvatar
                ? `
              <img 
                src="${userAvatar}" 
                alt="${user.name}"
                style="
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 3px solid var(--primary-light);
                  box-shadow: 0 4px 12px rgba(45, 90, 39, 0.2);
                "
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              />
              <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%); display: none; align-items: center; justify-content: center; border: 3px solid var(--primary-light); position: absolute; top: 0; left: 0;">
                <i class="fas fa-user text-white" style="font-size: 2rem;"></i>
              </div>
            `
                : `
              <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%); display: flex; align-items: center; justify-content: center; border: 3px solid var(--primary-light);">
                <i class="fas fa-user text-white" style="font-size: 2rem;"></i>
              </div>
            `
            }
          </div>
          <div style="margin-top: 0.75rem;">
            <h5 style="margin: 0; color: var(--text-primary); font-weight: 600;">${
              user.name
            }</h5>
            <small style="color: var(--text-muted);">Pending Approval</small>
          </div>
        </div>

        <!-- Personal Information -->
        <div style="margin-bottom: 1rem;">
          <h6 style="color: var(--primary-color); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; border-bottom: 1px solid #e9ecef; padding-bottom: 0.25rem;">
            <i class="fas fa-user me-1"></i>Personal Information
          </h6>
          <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
            <div>
              <small style="color: #6c757d; display: block;">Full Name</small>
              <div style="font-weight: 500;">${user.name}</div>
            </div>
            <div>
              <small style="color: #6c757d; display: block;">Email</small>
              <div style="font-weight: 500; word-break: break-word;">${
                user.email
              }</div>
            </div>
            <div>
              <small style="color: #6c757d; display: block;">Contact</small>
              <div style="font-weight: 500;">${user.contact}</div>
            </div>
            <div>
              <small style="color: #6c757d; display: block;">Position</small>
              <span class="badge bg-light text-dark border" style="font-size: 0.75rem;">${
                user.position
              }</span>
            </div>
          </div>
        </div>

        <!-- Barangay Information -->
        <div style="margin-bottom: 1rem;">
          <h6 style="color: var(--primary-color); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; border-bottom: 1px solid #e9ecef; padding-bottom: 0.25rem;">
            <i class="fas fa-map-marker-alt me-1"></i>Barangay Information
          </h6>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div>
              <small style="color: #6c757d; display: block;">Barangay</small>
              <div style="font-weight: 500;">${user.barangay_name}</div>
            </div>
            <div>
              <small style="color: #6c757d; display: block;">Municipality</small>
              <div style="font-weight: 500;">${user.municipality}</div>
            </div>
          </div>
        </div>

        <!-- Registration Details -->
        <div>
          <h6 style="color: var(--primary-color); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; border-bottom: 1px solid #e9ecef; padding-bottom: 0.25rem;">
            <i class="fas fa-clock me-1"></i>Registration Details
          </h6>
          <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
            <div>
              <small style="color: #6c757d; display: block;">Date Registered</small>
              <div style="font-weight: 500; font-size: 0.85rem;">
                ${new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div>
              <small style="color: #6c757d; display: block;">Status</small>
              <span class="badge bg-warning text-dark" style="font-size: 0.75rem;">Pending Approval</span>
            </div>
          </div>
        </div>
      </div>
    `;

    showAlert.info("User Details", detailsHTML, "Close", null, true);
  };

  const handleBulkApprove = async () => {
    if (currentUsers.length === 0) return;

    // Check if any action is already in progress
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Approve Users",
      `Are you sure you want to approve all ${currentUsers.length} users on this page? This action will grant them full access to the system.`,
      "Yes, Approve All",
      "Cancel"
    );

    if (!result.isConfirmed) {
      return;
    }

    // Set global lock
    setActionLock(true);

    try {
      const approvePromises = currentUsers.map((user) =>
        fetch(
          `${import.meta.env.VITE_LARAVEL_API}/admin/users/${user.id}/approve`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
      );

      const responses = await Promise.all(approvePromises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        showToast.success(
          `${currentUsers.length} users approved successfully!`
        );

        // Remove approved users from pending list
        const approvedUserIds = currentUsers.map((user) => user.id);
        setPendingUsers((prev) =>
          prev.filter((user) => !approvedUserIds.includes(user.id))
        );

        // Refresh data to update stats
        await fetchPendingUsers();
      } else {
        throw new Error("Failed to approve some users");
      }
    } catch (error) {
      console.error("Error in bulk approval:", error);
      showAlert.error(
        "Approval Failed",
        "Failed to approve some users. Please try again."
      );
    } finally {
      // Clear global lock
      setActionLock(false);
    }
  };

  const getUniqueMunicipalities = () => {
    const municipalities = [
      ...new Set(pendingUsers.map((user) => user.municipality)),
    ];
    return municipalities.sort();
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "fas fa-sort";
    return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  };

  // Enhanced helper to check if any action is disabled
  const isActionDisabled = (userId = null) => {
    return actionLock || (actionLoading && actionLoading !== userId);
  };

  // Skeleton loader for table rows
  const TableRowSkeleton = () => {
    return (
      <tr className="align-middle">
        <td className="ps-4 text-center">
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
        <td className="d-none d-lg-table-cell">
          <div className="skeleton-line" style={{ width: "70%" }}></div>
        </td>
        <td className="d-none d-md-table-cell">
          <div className="skeleton-badge"></div>
        </td>
        <td className="d-none d-xl-table-cell">
          <div className="skeleton-line" style={{ width: "80%" }}></div>
        </td>
        <td className="d-none d-sm-table-cell text-center">
          <div
            className="skeleton-line"
            style={{ width: "60%", margin: "0 auto" }}
          ></div>
        </td>
      </tr>
    );
  };

  // Skeleton loader for stats cards
  const StatsCardSkeleton = () => {
    return (
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
  };

  return (
    <div className="container-fluid">
      {/* Page Header - Always visible */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1" style={{ color: "var(--text-primary)" }}>
            Approval Queue
          </h1>
          <p className="text-muted mb-0">
            Manage barangay account registration requests
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--background-white)",
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
              whiteSpace: "nowrap",
            }}
          >
            <i className="fas fa-clock me-2"></i>
            <span className="d-none d-sm-inline">Pending Approval:</span>
            <span> {loading ? "..." : pendingUsers.length}</span>
          </div>
          {!loading && currentUsers.length > 0 && (
            <button
              className="btn btn-success btn-sm"
              onClick={handleBulkApprove}
              disabled={isActionDisabled()}
              style={{
                backgroundColor: "var(--accent-color)",
                borderColor: "var(--accent-color)",
                whiteSpace: "nowrap",
                opacity: isActionDisabled() ? 0.6 : 1,
              }}
            >
              <i className="fas fa-check-double me-1"></i>
              <span className="d-none d-sm-inline">Approve Page</span>
              <span className="d-sm-none">Approve</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Controls - Always visible */}
      <div className="card shadow border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span
                  className="input-group-text"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, barangay, municipality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isActionDisabled()}
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--input-text)",
                    opacity: isActionDisabled() ? 0.6 : 1,
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm("")}
                    disabled={isActionDisabled()}
                    style={{
                      borderColor: "var(--input-border)",
                      color: "var(--text-secondary)",
                      opacity: isActionDisabled() ? 0.6 : 1,
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select custom-dropdown"
                value={filterMunicipality}
                onChange={(e) => setFilterMunicipality(e.target.value)}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                  opacity: loading || isActionDisabled() ? 0.6 : 1,
                }}
              >
                <option value="all">All Municipalities</option>
                {getUniqueMunicipalities().map((municipality) => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select custom-dropdown"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                  opacity: loading || isActionDisabled() ? 0.6 : 1,
                }}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card shadow border-0">
        <div
          className="card-header py-3 border-bottom"
          style={{
            backgroundColor: "var(--primary-color)",
            background:
              "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
            color: "var(--background-white)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="fas fa-user-check me-2"></i>
              Pending Barangay Accounts
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredUsers.length} found
                  {searchTerm || filterMunicipality !== "all"
                    ? " after filtering"
                    : ""}
                  )
                </small>
              )}
            </h5>
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
            // Loading state for table
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--background-white)",
                      borderBottom: "2px solid var(--primary-color)",
                    }}
                  >
                    <th
                      className="ps-4 text-center"
                      style={{
                        width: "60px",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      #
                    </th>
                    <th
                      className="text-center"
                      style={{
                        width: "140px",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      Actions
                    </th>
                    <th
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start w-100"
                          onClick={() => handleSort("name")}
                          disabled={isActionDisabled()}
                          style={{
                            color: "var(--text-primary)",
                            background: "transparent",
                            border: "none",
                            cursor: isActionDisabled()
                              ? "not-allowed"
                              : "pointer",
                            opacity: isActionDisabled() ? 0.6 : 1,
                          }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            User Information
                            <i className={`ms-1 ${getSortIcon("name")}`}></i>
                          </span>
                        </button>
                      </div>
                    </th>
                    <th
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start w-100"
                          onClick={() => handleSort("barangay_name")}
                          disabled={isActionDisabled()}
                          style={{
                            color: "var(--text-primary)",
                            background: "transparent",
                            border: "none",
                            cursor: isActionDisabled()
                              ? "not-allowed"
                              : "pointer",
                            opacity: isActionDisabled() ? 0.6 : 1,
                          }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Barangay
                            <i
                              className={`ms-1 ${getSortIcon("barangay_name")}`}
                            ></i>
                          </span>
                        </button>
                      </div>
                    </th>
                    <th
                      className="d-none d-lg-table-cell"
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start w-100"
                          onClick={() => handleSort("municipality")}
                          disabled={isActionDisabled()}
                          style={{
                            color: "var(--text-primary)",
                            background: "transparent",
                            border: "none",
                            cursor: isActionDisabled()
                              ? "not-allowed"
                              : "pointer",
                            opacity: isActionDisabled() ? 0.6 : 1,
                          }}
                        >
                          <span className="d-flex align-items-center justify-content-between">
                            Municipality
                            <i
                              className={`ms-1 ${getSortIcon("municipality")}`}
                            ></i>
                          </span>
                        </button>
                      </div>
                    </th>
                    <th
                      className="d-none d-md-table-cell"
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      Position
                    </th>
                    <th
                      className="d-none d-xl-table-cell"
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      Contact
                    </th>
                    <th
                      className="d-none d-sm-table-cell text-center"
                      style={{
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        padding: "0.75rem 0.5rem",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold"
                          onClick={() => handleSort("created_at")}
                          disabled={isActionDisabled()}
                          style={{
                            color: "var(--text-primary)",
                            background: "transparent",
                            border: "none",
                            cursor: isActionDisabled()
                              ? "not-allowed"
                              : "pointer",
                            opacity: isActionDisabled() ? 0.6 : 1,
                          }}
                        >
                          <span className="d-flex align-items-center">
                            Registered
                            <i
                              className={`ms-1 ${getSortIcon("created_at")}`}
                            ></i>
                          </span>
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show 5 skeleton rows while loading */}
                  {[...Array(5)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))}
                </tbody>
              </table>
              <div className="text-center py-4">
                <div className="spinner-border text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="text-muted">Fetching approval data...</span>
              </div>
            </div>
          ) : currentUsers.length === 0 ? (
            // Empty state
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-search fa-4x text-muted opacity-50"></i>
              </div>
              <h4 className="text-muted mb-3">
                {pendingUsers.length === 0
                  ? "No Pending Approvals"
                  : "No Matching Results"}
              </h4>
              <p className="text-muted mb-4">
                {pendingUsers.length === 0
                  ? "All barangay account requests have been processed."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {(searchTerm || filterMunicipality !== "all") && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterMunicipality("all");
                  }}
                  disabled={isActionDisabled()}
                  style={{
                    backgroundColor: "var(--btn-primary-bg)",
                    borderColor: "var(--btn-primary-bg)",
                    opacity: isActionDisabled() ? 0.6 : 1,
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            // Loaded state with data
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "var(--background-light)",
                        borderBottom: "2px solid var(--primary-color)",
                      }}
                    >
                      <th
                        className="ps-4 text-center"
                        style={{
                          width: "60px",
                          color: "var(--text-primary)",
                          fontWeight: "600",
                        }}
                      >
                        #
                      </th>
                      <th
                        className="text-center"
                        style={{
                          width: "140px",
                          color: "var(--text-primary)",
                          fontWeight: "600",
                        }}
                      >
                        Actions
                      </th>
                      <th
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          padding: "0.75rem 0.5rem",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start w-100"
                            onClick={() => handleSort("name")}
                            disabled={isActionDisabled()}
                            style={{
                              color: "var(--text-primary)",
                              background: "transparent",
                              border: "none",
                              cursor: isActionDisabled()
                                ? "not-allowed"
                                : "pointer",
                              opacity: isActionDisabled() ? 0.6 : 1,
                            }}
                          >
                            <span className="d-flex align-items-center justify-content-between">
                              User Information
                              <i className={`ms-1 ${getSortIcon("name")}`}></i>
                            </span>
                          </button>
                        </div>
                      </th>
                      <th
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          padding: "0.75rem 0.5rem",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start w-100"
                            onClick={() => handleSort("barangay_name")}
                            disabled={isActionDisabled()}
                            style={{
                              color: "var(--text-primary)",
                              background: "transparent",
                              border: "none",
                              cursor: isActionDisabled()
                                ? "not-allowed"
                                : "pointer",
                              opacity: isActionDisabled() ? 0.6 : 1,
                            }}
                          >
                            <span className="d-flex align-items-center justify-content-between">
                              Barangay
                              <i
                                className={`ms-1 ${getSortIcon(
                                  "barangay_name"
                                )}`}
                              ></i>
                            </span>
                          </button>
                        </div>
                      </th>
                      <th
                        className="d-none d-lg-table-cell"
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          padding: "0.75rem 0.5rem",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start w-100"
                            onClick={() => handleSort("municipality")}
                            disabled={isActionDisabled()}
                            style={{
                              color: "var(--text-primary)",
                              background: "transparent",
                              border: "none",
                              cursor: isActionDisabled()
                                ? "not-allowed"
                                : "pointer",
                              opacity: isActionDisabled() ? 0.6 : 1,
                            }}
                          >
                            <span className="d-flex align-items-center justify-content-between">
                              Municipality
                              <i
                                className={`ms-1 ${getSortIcon(
                                  "municipality"
                                )}`}
                              ></i>
                            </span>
                          </button>
                        </div>
                      </th>
                      <th
                        className="d-none d-md-table-cell"
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          padding: "0.75rem 0.5rem",
                        }}
                      >
                        Position
                      </th>
                      <th
                        className="d-none d-xl-table-cell"
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          padding: "0.75rem 0.5rem",
                        }}
                      >
                        Contact
                      </th>
                      <th
                        className="d-none d-sm-table-cell text-center"
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: "600",
                          padding: "0.75rem 0.5rem",
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <button
                            className="btn btn-link p-0 border-0 text-decoration-none fw-semibold"
                            onClick={() => handleSort("created_at")}
                            disabled={isActionDisabled()}
                            style={{
                              color: "var(--text-primary)",
                              background: "transparent",
                              border: "none",
                              cursor: isActionDisabled()
                                ? "not-allowed"
                                : "pointer",
                              opacity: isActionDisabled() ? 0.6 : 1,
                            }}
                          >
                            <span className="d-flex align-items-center">
                              Registered
                              <i
                                className={`ms-1 ${getSortIcon("created_at")}`}
                              ></i>
                            </span>
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr key={user.id} className="align-middle">
                        <td className="ps-4 text-center fw-bold text-muted">
                          {startIndex + index + 1}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            {/* View Details Button */}
                            <button
                              className="btn action-btn btn-view btn-sm"
                              onClick={() => handleViewDetails(user)}
                              disabled={isActionDisabled(user.id)}
                              title="View Details"
                            >
                              {actionLoading === user.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-eye"></i>
                              )}
                            </button>

                            {/* Approve Button */}
                            <button
                              className="btn action-btn btn-approve btn-sm"
                              onClick={() => handleApprove(user.id)}
                              disabled={isActionDisabled(user.id)}
                              title="Approve User"
                            >
                              {actionLoading === user.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </button>

                            {/* Reject Button */}
                            <button
                              className="btn action-btn btn-reject btn-sm"
                              onClick={() =>
                                openRejectionModal(user.id, user.name)
                              }
                              disabled={isActionDisabled(user.id)}
                              title="Reject User"
                            >
                              {actionLoading === user.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-times"></i>
                              )}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="position-relative me-3">
                              <div className="position-relative">
                                {user.avatar ? (
                                  <img
                                    src={formatAvatarUrl(user.avatar)}
                                    alt={user.name}
                                    className="rounded-circle"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      // If image fails to load, replace with placeholder
                                      e.target.style.display = "none";
                                      // Create and show placeholder
                                      const placeholder =
                                        document.createElement("div");
                                      placeholder.className =
                                        "bg-secondary rounded-circle d-flex align-items-center justify-content-center";
                                      placeholder.style.width = "40px";
                                      placeholder.style.height = "40px";
                                      placeholder.innerHTML =
                                        '<i class="fas fa-user text-white"></i>';
                                      e.target.parentNode.appendChild(
                                        placeholder
                                      );
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                    }}
                                  >
                                    <i className="fas fa-user text-white"></i>
                                  </div>
                                )}
                              </div>
                              <span
                                className="position-absolute bottom-0 end-0 bg-warning border border-2 border-white rounded-circle"
                                style={{ width: "10px", height: "10px" }}
                              ></span>
                            </div>
                            <div>
                              <div
                                className="fw-semibold"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {user.name}
                              </div>
                              <small className="text-muted d-block">
                                {user.email}
                              </small>
                              <div className="d-flex gap-2 mt-1 d-md-none">
                                <small className="badge bg-light text-dark">
                                  {user.position}
                                </small>
                                <small className="text-muted">
                                  {user.contact}
                                </small>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div
                            className="fw-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {user.barangay_name}
                          </div>
                          <small className="text-muted d-lg-none">
                            {user.municipality}
                          </small>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          {user.municipality}
                        </td>
                        <td className="d-none d-md-table-cell">
                          <span className="badge bg-light text-dark border">
                            {user.position}
                          </span>
                        </td>
                        <td className="d-none d-xl-table-cell">
                          {user.contact}
                        </td>
                        <td className="d-none d-sm-table-cell text-center">
                          <small className="text-muted">
                            {new Date(user.created_at).toLocaleDateString()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - RESPONSIVE */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-top-0 py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    {/* Results Count */}
                    <div className="text-center text-md-start">
                      <small className="text-muted">
                        Showing{" "}
                        <span className="fw-semibold">
                          {startIndex + 1}-
                          {Math.min(endIndex, filteredUsers.length)}
                        </span>{" "}
                        of{" "}
                        <span className="fw-semibold">
                          {filteredUsers.length}
                        </span>{" "}
                        entries
                      </small>
                    </div>

                    {/* Pagination Controls */}
                    <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
                      {/* Page Navigation Buttons */}
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1 || isActionDisabled()}
                          style={{
                            borderColor: "var(--primary-color)",
                            color: "var(--primary-color)",
                            minWidth: "80px",
                            opacity:
                              currentPage === 1 || isActionDisabled() ? 0.6 : 1,
                          }}
                        >
                          <i className="fas fa-chevron-left me-1 d-none d-sm-inline"></i>
                          <span className="d-none d-sm-inline">Previous</span>
                          <span className="d-sm-none">Prev</span>
                        </button>

                        {/* Page Numbers - Responsive */}
                        <div className="d-none d-md-flex gap-1">
                          {(() => {
                            let pages = [];
                            const maxVisiblePages = 5;

                            if (totalPages <= maxVisiblePages) {
                              // Show all pages if total pages is small
                              pages = Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                              );
                            } else {
                              // Always show first page
                              pages.push(1);

                              // Calculate start and end of visible pages
                              let start = Math.max(2, currentPage - 1);
                              let end = Math.min(
                                totalPages - 1,
                                currentPage + 1
                              );

                              // Adjust if at the beginning
                              if (currentPage <= 2) {
                                end = 4;
                              }
                              // Adjust if at the end
                              else if (currentPage >= totalPages - 1) {
                                start = totalPages - 3;
                              }

                              // Add ellipsis after first page if needed
                              if (start > 2) {
                                pages.push("...");
                              }

                              // Add middle pages
                              for (let i = start; i <= end; i++) {
                                pages.push(i);
                              }

                              // Add ellipsis before last page if needed
                              if (end < totalPages - 1) {
                                pages.push("...");
                              }

                              // Always show last page
                              if (totalPages > 1) {
                                pages.push(totalPages);
                              }
                            }

                            return pages.map((page, index) => (
                              <button
                                key={index}
                                className={`btn btn-sm ${
                                  page === "..."
                                    ? "btn-outline-secondary disabled"
                                    : currentPage === page
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() =>
                                  page !== "..." && setCurrentPage(page)
                                }
                                disabled={page === "..." || isActionDisabled()}
                                style={
                                  page !== "..." && currentPage === page
                                    ? {
                                        backgroundColor:
                                          "var(--btn-primary-bg)",
                                        borderColor: "var(--btn-primary-bg)",
                                        minWidth: "40px",
                                      }
                                    : page !== "..."
                                    ? {
                                        borderColor: "var(--primary-color)",
                                        color: "var(--primary-color)",
                                        minWidth: "40px",
                                        opacity: isActionDisabled() ? 0.6 : 1,
                                      }
                                    : {
                                        minWidth: "40px",
                                      }
                                }
                              >
                                {page}
                              </button>
                            ));
                          })()}
                        </div>

                        {/* Mobile page indicator */}
                        <div className="d-md-none d-flex align-items-center px-3">
                          <small className="text-muted">
                            Page <span className="fw-bold">{currentPage}</span>{" "}
                            of <span className="fw-bold">{totalPages}</span>
                          </small>
                        </div>

                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={
                            currentPage === totalPages || isActionDisabled()
                          }
                          style={{
                            borderColor: "var(--primary-color)",
                            color: "var(--primary-color)",
                            minWidth: "80px",
                            opacity:
                              currentPage === totalPages || isActionDisabled()
                                ? 0.6
                                : 1,
                          }}
                        >
                          <span className="d-none d-sm-inline">Next</span>
                          <span className="d-sm-none">Next</span>
                          <i className="fas fa-chevron-right ms-1 d-none d-sm-inline"></i>
                        </button>
                      </div>

                      {/* Page Size Selector for Mobile */}
                      <div className="d-md-none">
                        <select
                          className="form-select form-select-sm"
                          value={itemsPerPage}
                          onChange={(e) =>
                            setItemsPerPage(Number(e.target.value))
                          }
                          disabled={isActionDisabled()}
                          style={{
                            backgroundColor: "var(--input-bg)",
                            borderColor: "var(--input-border)",
                            color: "var(--input-text)",
                            width: "120px",
                            opacity: isActionDisabled() ? 0.6 : 1,
                          }}
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
              )}
            </>
          )}
        </div>

        {!loading && currentUsers.length > 0 && totalPages <= 1 && (
          <div className="card-footer bg-white border-top-0 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {filteredUsers.length} of {pendingUsers.length} pending
                registration(s)
              </small>
              <small className="text-muted">
                Last updated: {new Date().toLocaleTimeString()}
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats - RESPONSIVE with loading state */}
      <div className="row mt-4 g-3">
        {loading ? (
          // Show skeleton stats while loading
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          // Show actual stats when loaded
          <>
            <div className="col-6 col-md-3">
              <div className="card border-left-primary shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div
                        className="text-xs fw-bold text-primary text-uppercase mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Total Pending
                      </div>
                      <div className="h5 mb-0 fw-bold text-gray-800">
                        {pendingUsers.length}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-clock fa-lg text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-left-success shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div
                        className="text-xs fw-bold text-success text-uppercase mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Filtered Results
                      </div>
                      <div className="h5 mb-0 fw-bold text-gray-800">
                        {filteredUsers.length}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-filter fa-lg text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-left-warning shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div
                        className="text-xs fw-bold text-warning text-uppercase mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Municipalities
                      </div>
                      <div className="h5 mb-0 fw-bold text-gray-800">
                        {getUniqueMunicipalities().length}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-map-marker-alt fa-lg text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-left-info shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div
                        className="text-xs fw-bold text-info text-uppercase mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Current Page
                      </div>
                      <div className="h5 mb-0 fw-bold text-gray-800">
                        {currentPage}/{totalPages}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-file-alt fa-lg text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
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

export default Approvals;
