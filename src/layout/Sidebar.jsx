// Sidebar.jsx - FIXED with Rejected User Support
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, Link } from "react-router-dom";

const Sidebar = ({ onCloseSidebar }) => {
  const { user, isAdmin, isBarangay, isApproved, isPending, pendingApprovals } =
    useAuth();
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

  // Admin Sidebar Items
  const adminMenuItems = [
    {
      heading: "Core",
      items: [
        {
          icon: "fas fa-tachometer-alt",
          label: "Dashboard",
          href: "/dashboard",
        },
      ],
    },
    {
      heading: "Municipality Management",
      items: [
        {
          icon: "fas fa-map-marker-alt",
          label: "Municipality Overview",
          href: "/admin/municipality",
        },
        {
          icon: "fas fa-users",
          label: "Barangay Management",
          href: "/admin/barangays",
        },
        {
          icon: "fas fa-chart-bar",
          label: "Municipal Analytics",
          href: "/admin/analytics",
        },
      ],
    },
    {
      heading: "User Management",
      items: [
        {
          icon: "fas fa-user-check",
          label: "Approval Queue",
          href: "/admin/approvals",
          badge: pendingApprovals,
        },
        { 
          icon: "fas fa-users-cog", 
          label: "All Users", 
          href: "/admin/users" 
        },
      ],
    },
    {
      heading: "Reports",
      items: [
        {
          icon: "fas fa-file-alt",
          label: "Municipal Reports",
          href: "/admin/reports",
        },
        {
          icon: "fas fa-download",
          label: "Export Data",
          href: "/admin/export",
        },
      ],
    },
  ];

  // Barangay Sidebar Items - Full access for approved barangay users
  const barangayMenuItems = [
    {
      heading: "Core",
      items: [
        {
          icon: "fas fa-tachometer-alt",
          label: "Dashboard",
          href: "/dashboard",
        },
      ],
    },
    {
      heading: "Population Management",
      items: [
        {
          icon: "fas fa-users",
          label: "Population Data",
          href: "/barangay/population",
        },
        {
          icon: "fas fa-user-plus",
          label: "Add Resident",
          href: "/barangay/residents/add",
        },
        {
          icon: "fas fa-list",
          label: "Resident List",
          href: "/barangay/residents",
        },
      ],
    },
    {
      heading: "Incident Monitoring",
      items: [
        {
          icon: "fas fa-map-marker-alt",
          label: "Incident Map",
          href: "/barangay/incident-map",
        },
        {
          icon: "fas fa-exclamation-triangle",
          label: "Report Incident",
          href: "/barangay/incidents/report",
        },
        {
          icon: "fas fa-list",
          label: "Incident Reports",
          href: "/barangay/incidents",
        },
      ],
    },
    {
      heading: "Disaster Management",
      items: [
        {
          icon: "fas fa-house-damage",
          label: "Affected Population",
          href: "/barangay/affected",
        },
        {
          icon: "fas fa-hands-helping",
          label: "Assistance Tracking",
          href: "/barangay/assistance",
        },
        {
          icon: "fas fa-chart-bar",
          label: "Barangay Analytics",
          href: "/barangay/analytics",
        },
      ],
    },
    {
      heading: "Reports",
      items: [
        {
          icon: "fas fa-file-alt",
          label: "Generate Reports",
          href: "/barangay/reports",
        },
        { 
          icon: "fas fa-print", 
          label: "Print Forms", 
          href: "/barangay/print" 
        },
      ],
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

  // Rejected User Sidebar Items - Limited access (NEW)
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

  if (isAdmin) {
    menuItems = adminMenuItems;
  } else if (isBarangay) {
    if (isApproved) {
      menuItems = barangayMenuItems; // Full access for approved barangay users
    } else if (isPending) {
      menuItems = pendingApprovalMenuItems; // Limited access for pending users
    } else if (user?.status === "rejected") { // NEW: Handle rejected users
      menuItems = rejectedUserMenuItems; // Limited access for rejected users
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

  return (
    <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">
          {menuItems.map(renderMenuSection)}

          {/* Common Settings for All Roles - ALWAYS VISIBLE */}
          <div className="sb-sidenav-menu-heading">Settings</div>
          
          {/* Profile Link - Accessible to ALL authenticated users */}
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
          
          {/* Settings Link - Accessible to ALL authenticated users */}
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
            : user?.status === "rejected" // NEW: Show rejected status
            ? "Account Rejected"
            : user?.barangay_name}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;