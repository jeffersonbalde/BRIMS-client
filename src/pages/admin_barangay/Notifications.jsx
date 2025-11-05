// pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert, showToast } from "../../services/notificationService";

const Notifications = () => {
  const { user, token, refreshNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setPagination(data.pagination || {});
      } else {
        throw new Error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showAlert.error("Error", "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const isActionDisabled = (notificationId = null) => {
    return actionLock || (actionLoading && actionLoading !== notificationId);
  };

  const markAsRead = async (notificationId) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    setActionLock(true);
    setActionLoading(notificationId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        refreshNotifications();
        showToast.success("Notification marked as read");
      } else {
        throw new Error("Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      showToast.error("Failed to mark as read");
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const markAllAsRead = async () => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    setActionLock(true);
    setActionLoading('mark-all-read');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications/mark-all-read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
        refreshNotifications();
        showToast.success(`Marked ${data.marked_count} notifications as read`);
      } else {
        throw new Error("Failed to mark all as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      showToast.error("Failed to mark all as read");
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      "Yes, Delete",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading(notificationId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        const deletedNotif = notifications.find(n => n.id === notificationId);
        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
          refreshNotifications();
        }
        showToast.success("Notification deleted");
      } else {
        throw new Error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast.error("Failed to delete notification");
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    const result = await showAlert.confirm(
      "Delete All Notifications",
      `Are you sure you want to delete all ${notifications.length} notifications? This action cannot be undone.`,
      "Yes, Delete All",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading('delete-all');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/notifications`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications([]);
        setUnreadCount(0);
        refreshNotifications();
        showToast.success(`Deleted ${data.deleted_count} notifications`);
      } else {
        throw new Error("Failed to delete all notifications");
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      showToast.error("Failed to delete all notifications");
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      incident_reported: "fas fa-exclamation-triangle",
      incident_status_changed: "fas fa-sync-alt",
      registration_approved: "fas fa-user-check",
      registration_rejected: "fas fa-user-times",
      admin_alert: "fas fa-bullhorn"
    };
    return icons[type] || "fas fa-bell";
  };

  const getNotificationColor = (type) => {
    const colors = {
      incident_reported: "var(--warning-color, #ffc107)",
      incident_status_changed: "var(--info-color, #17a2b8)",
      registration_approved: "var(--success-color, #28a745)",
      registration_rejected: "var(--danger-color, #dc3545)",
      admin_alert: "var(--primary-color, #336b31)"
    };
    return colors[type] || "var(--secondary-color, #6c757d)";
  };

  const getNotificationBgColor = (type) => {
    const bgColors = {
      incident_reported: "rgba(255, 193, 7, 0.1)",
      incident_status_changed: "rgba(23, 162, 184, 0.1)",
      registration_approved: "rgba(40, 167, 69, 0.1)",
      registration_rejected: "rgba(220, 53, 69, 0.1)",
      admin_alert: "rgba(51, 107, 49, 0.1)"
    };
    return bgColors[type] || "rgba(108, 117, 125, 0.1)";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handlePageChange = (page) => {
    fetchNotifications(page);
  };

  // Skeleton Loader
  const NotificationSkeleton = () => (
    <div className="notification-item skeleton">
      <div className="notification-avatar skeleton-avatar"></div>
      <div className="notification-content">
        <div className="skeleton-line title"></div>
        <div className="skeleton-line message"></div>
        <div className="skeleton-line time"></div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-1">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1 text-dark">Notifications</h1>
          <p className="text-muted mb-0">
            Stay updated with your incident reports and system activities
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <div className="notification-badge">
              <i className="fas fa-bell me-2"></i>
              {unreadCount} Unread
            </div>
          )}
          {notifications.length > 0 && (
            <div className="d-flex gap-2 flex-wrap">
              {unreadCount > 0 && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={markAllAsRead}
                  disabled={isActionDisabled('mark-all-read')}
                >
                  {actionLoading === 'mark-all-read' ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Marking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-double me-1"></i>
                      Mark All Read
                    </>
                  )}
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={deleteAllNotifications}
                disabled={isActionDisabled('delete-all')}
              >
                {actionLoading === 'delete-all' ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-1"></i>
                    Delete All
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Container */}
      <div className="notifications-container">
        <div className="notifications-header">
          <h6 className="notifications-title">
            <i className="fas fa-bell me-2"></i>
            Recent Notifications
            {!loading && (
              <span className="notifications-count">
                ({notifications.length} total{pagination.total > notifications.length ? ` of ${pagination.total}` : ''})
              </span>
            )}
          </h6>
        </div>

        <div className="notifications-body">
          {loading ? (
            // Loading state
            <div className="notifications-loading">
              {[...Array(5)].map((_, index) => (
                <NotificationSkeleton key={index} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            // Empty state
            <div className="notifications-empty">
              <div className="empty-icon">
                <i className="fas fa-bell-slash"></i>
              </div>
              <h5 className="empty-title">No Notifications</h5>
              <p className="empty-message">
                You don't have any notifications yet. Notifications about your incident reports and account activities will appear here.
              </p>
            </div>
          ) : (
            // Notifications list
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                >
                  <div 
                    className="notification-avatar"
                    style={{ 
                      backgroundColor: getNotificationBgColor(notification.type),
                      color: getNotificationColor(notification.type)
                    }}
                  >
                    <i className={getNotificationIcon(notification.type)}></i>
                  </div>

                  <div className="notification-content">
                    <div className="notification-header">
                      <h6 className="notification-title">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="unread-indicator"></span>
                        )}
                      </h6>
                      <span className="notification-time">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    
                    {/* Action Buttons with Consistent Colors */}
                    <div className="notification-actions">
                      {!notification.is_read && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => markAsRead(notification.id)}
                          disabled={isActionDisabled(notification.id)}
                          title="Mark as Read"
                        >
                          {actionLoading === notification.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <>
                              <i className="fas fa-check me-1"></i>
                              Mark Read
                            </>
                          )}
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteNotification(notification.id)}
                        disabled={isActionDisabled(notification.id)}
                        title="Delete Notification"
                      >
                        {actionLoading === notification.id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="notifications-pagination">
              <div className="pagination-info">
                <small>
                  Showing {((pagination.current_page - 1) * pagination.per_page) + 1}-
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total}
                </small>
              </div>
              <div className="pagination-controls">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1 || isActionDisabled()}
                >
                  <i className="fas fa-chevron-left me-1"></i>
                  Previous
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page || isActionDisabled()}
                >
                  Next
                  <i className="fas fa-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
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

      {/* Fixed CSS */}
      <style jsx>{`
        .notifications-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .notifications-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          color: white;
        }

        .notifications-title {
          margin: 0;
          display: flex;
          align-items: center;
          font-size: 1rem;
        }

        .notifications-count {
          opacity: 0.8;
          font-size: 0.875rem;
          margin-left: 0.5rem;
        }

        .notification-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          background-color: var(--primary-color);
        }

        .notifications-body {
          padding: 0;
        }

        .notification-item {
          display: flex;
          padding: 1.25rem;
          border-bottom: 1px solid #f8f9fa;
          transition: all 0.3s ease;
          position: relative;
        }

        .notification-item:hover {
          background-color: #f8f9fa;
        }

        .notification-item.unread {
          background-color: rgba(51, 107, 49, 0.03);
          border-left: 4px solid var(--primary-color);
        }

        .notification-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }

        .notification-title {
          margin: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #2d3748;
          font-size: 0.95rem;
        }

        .unread-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--primary-color);
          display: inline-block;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #718096;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .notification-message {
          margin: 0;
          color: #4a5568;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .notifications-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: #718096;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
          color: var(--primary-light);
        }

        .empty-title {
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .empty-message {
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .notifications-pagination {
          padding: 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f8f9fa;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .pagination-controls {
          display: flex;
          gap: 0.5rem;
        }

        /* Skeleton Loading */
        .skeleton {
          opacity: 0.7;
        }

        .skeleton-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        .skeleton-line {
          height: 12px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-line.title {
          width: 70%;
          height: 16px;
        }

        .skeleton-line.message {
          width: 90%;
          height: 14px;
        }

        .skeleton-line.time {
          width: 40%;
          height: 12px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .notification-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .notification-time {
            margin-top: 0.25rem;
          }

          .notification-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .notification-actions .btn {
            width: 100%;
            justify-content: center;
          }

          .notifications-pagination {
            flex-direction: column;
            text-align: center;
          }

          .pagination-controls {
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .notification-item {
            padding: 1rem;
            flex-direction: column;
          }

          .notification-avatar {
            margin-right: 0;
            margin-bottom: 1rem;
            align-self: flex-start;
          }

          .notification-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .notification-title {
            font-size: 0.9rem;
          }

          .notification-message {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;