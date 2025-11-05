// Sidebar.jsx - FINALIZED STRUCTURE
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, Link } from "react-router-dom";

const Sidebar = ({ onCloseSidebar }) => {
  const {
    user,
    isAdmin,
    isBarangay,
    isApproved,
    isPending,
    pendingApprovals,
    unreadNotifications,
  } = useAuth();
  const location = useLocation();

  // Helper function to check if a link is active
  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  // SAFE Function to close sidebar on mobile - FIXED
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768 && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  // Function to handle link click
  const handleLinkClick = () => {
    closeSidebarOnMobile();
  };

  // Admin Sidebar Items - FINALIZED
  const adminMenuItems = [
    {
      heading: "Dashboard",
      items: [
        {
          icon: "fas fa-tachometer-alt",
          label: "Dashboard",
          href: "/dashboard",
        },
      ],
    },
    {
      heading: "Incident Management",
      items: [
        {
          icon: "fas fa-exclamation-triangle",
          label: "All Incidents",
          href: "/incidents",
        },
        {
          icon: "fas fa-chart-bar",
          label: "Incident Analytics",
          href: "/incident-analytics",
        },
      ],
    },
    {
      heading: "User Management",
      items: [
        {
          icon: "fas fa-user-check",
          label: "Approval Queue",
          href: "/approvals",
          badge: pendingApprovals,
        },
        {
          icon: "fas fa-users-cog",
          label: "User Management",
          href: "/users",
        },
      ],
    },
    {
      heading: "Population & Reports",
      items: [
        {
          icon: "fas fa-users",
          label: "Population Data",
          href: "/population",
        },
        {
          icon: "fas fa-file-alt",
          label: "Municipal Reports",
          href: "/reports",
        },
      ],
    },
    {
      heading: "Notifications",
      items: [
        {
          icon: "fas fa-bell",
          label: "Notifications",
          href: "/notifications",
          badge: unreadNotifications,
        },
      ],
    },
  ];

  // Barangay Sidebar Items - MODIFIED: No headings, just tabs
  const barangayMenuItems = [
    {
      icon: "fas fa-tachometer-alt",
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: "fas fa-exclamation-triangle",
      label: "My Incidents",
      href: "/incidents",
    },
    {
      icon: "fas fa-house-damage",
      label: "Affected Population",
      href: "/affected-population",
    },
    {
      icon: "fas fa-bell",
      label: "Notifications",
      href: "/notifications",
      badge: unreadNotifications,
    },
    {
      icon: "fas fa-file-export",
      label: "Generate Reports",
      href: "/reports",
    },
  ];

  // Pending Approval Sidebar Items - Limited access
  const pendingApprovalMenuItems = [
    {
      heading: "Account",
      items: [
        {
          icon: "fas fa-clock",
          label: "Pending Approval",
          href: "/dashboard",
        },
      ],
    },
  ];

  // Rejected User Sidebar Items - Limited access
  const rejectedUserMenuItems = [
    {
      heading: "Account",
      items: [
        {
          icon: "fas fa-times-circle",
          label: "Account Rejected",
          href: "/dashboard",
        },
      ],
    },
  ];

  // Choose menu based on role and approval status
  let menuItems = [];
  let isBarangayMenu = false;

  if (isAdmin) {
    menuItems = adminMenuItems;
  } else if (isBarangay) {
    if (isApproved) {
      menuItems = barangayMenuItems;
      isBarangayMenu = true;
    } else if (isPending) {
      menuItems = pendingApprovalMenuItems;
    } else if (user?.status === "rejected") {
      menuItems = rejectedUserMenuItems;
    }
  }

  const renderMenuSection = (section, index) => (
    <React.Fragment key={index}>
      <div className="sb-sidenav-menu-heading">{section.heading}</div>
      {section.items.map((item, itemIndex) => {
        const isActive = isActiveLink(item.href);
        return (
          <Link
            key={itemIndex}
            className={`nav-link ${isActive ? "active" : ""}`}
            to={item.href}
            onClick={handleLinkClick}
          >
            <div className="sb-nav-link-icon">
              <i className={item.icon}></i>
            </div>
            {item.label}
            {item.badge && item.badge > 0 && (
              <span className="badge bg-danger ms-2">{item.badge}</span>
            )}
            {isActive && (
              <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                <i className="fas fa-chevron-right small"></i>
              </span>
            )}
          </Link>
        );
      })}
    </React.Fragment>
  );

  const renderBarangayMenuItem = (item, index) => {
    const isActive = isActiveLink(item.href);
    return (
      <Link
        key={index}
        className={`nav-link ${isActive ? "active" : ""}`}
        to={item.href}
        onClick={handleLinkClick}
      >
        <div className="sb-nav-link-icon">
          <i className={item.icon}></i>
        </div>
        {item.label}
        {item.badge && item.badge > 0 && (
          <span className="badge bg-danger ms-2">{item.badge}</span>
        )}
        {isActive && (
          <span className="position-absolute top-50 end-0 translate-middle-y me-3">
            <i className="fas fa-chevron-right small"></i>
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">
          {/* Render menu based on type */}
          {isBarangayMenu ? (
            // Render barangay menu as flat list without headings
            barangayMenuItems.map(renderBarangayMenuItem)
          ) : (
            // Render other menus with section structure
            menuItems.map(renderMenuSection)
          )}

          {/* Common Settings for All Roles - ALWAYS VISIBLE */}
          <div className="sb-sidenav-menu-heading">Settings</div>

          <Link
            className={`nav-link ${isActiveLink("/profile") ? "active" : ""}`}
            to="/profile"
            onClick={handleLinkClick}
          >
            <div className="sb-nav-link-icon">
              <i className="fas fa-user"></i>
            </div>
            Profile
            {isActiveLink("/profile") && (
              <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                <i className="fas fa-chevron-right small"></i>
              </span>
            )}
          </Link>

          <Link
            className={`nav-link ${isActiveLink("/settings") ? "active" : ""}`}
            to="/settings"
            onClick={handleLinkClick}
          >
            <div className="sb-nav-link-icon">
              <i className="fas fa-cog"></i>
            </div>
            Settings
            {isActiveLink("/settings") && (
              <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                <i className="fas fa-chevron-right small"></i>
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="sb-sidenav-footer">
        <div className="small">Logged in as:</div>
        <span className="user-name">{user?.name || "User"}</span>
        <div className="small text-muted">
          {isAdmin
            ? "Municipal Admin"
            : isPending
            ? "Pending Approval"
            : user?.status === "rejected"
            ? "Account Rejected"
            : user?.barangay_name}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;