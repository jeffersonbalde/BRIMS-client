// Sidebar.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, isBarangay } = useAuth();

  // Admin Sidebar Items
  const adminMenuItems = [
    {
      heading: "Core",
      items: [
        { icon: "fas fa-tachometer-alt", label: "Dashboard", href: "/admin/dashboard" }
      ]
    },
    {
      heading: "Municipality Management",
      items: [
        { icon: "fas fa-map-marker-alt", label: "Municipality Overview", href: "/admin/municipality" },
        { icon: "fas fa-users", label: "Barangay Management", href: "/admin/barangays" },
        { icon: "fas fa-chart-bar", label: "Municipal Analytics", href: "/admin/analytics" }
      ]
    },
    {
      heading: "User Management",
      items: [
        { 
          icon: "fas fa-user-check", 
          label: "Approval Queue", 
          href: "/admin/approvals",
          badge: user?.pendingApprovals || 0
        },
        { icon: "fas fa-users-cog", label: "All Users", href: "/admin/users" }
      ]
    },
    {
      heading: "Reports",
      items: [
        { icon: "fas fa-file-alt", label: "Municipal Reports", href: "/admin/reports" },
        { icon: "fas fa-download", label: "Export Data", href: "/admin/export" }
      ]
    }
  ];

  // Barangay Sidebar Items
  const barangayMenuItems = [
    {
      heading: "Core",
      items: [
        { icon: "fas fa-tachometer-alt", label: "Dashboard", href: "/barangay/dashboard" }
      ]
    },
    {
      heading: "Population Management",
      items: [
        { icon: "fas fa-users", label: "Population Data", href: "/barangay/population" },
        { icon: "fas fa-user-plus", label: "Add Resident", href: "/barangay/residents/add" },
        { icon: "fas fa-list", label: "Resident List", href: "/barangay/residents" }
      ]
    },
    {
      heading: "Incident Monitoring",
      items: [
        { icon: "fas fa-map-marker-alt", label: "Incident Map", href: "/barangay/incident-map" },
        { icon: "fas fa-exclamation-triangle", label: "Report Incident", href: "/barangay/incidents/report" },
        { icon: "fas fa-list", label: "Incident Reports", href: "/barangay/incidents" }
      ]
    },
    {
      heading: "Disaster Management",
      items: [
        { icon: "fas fa-house-damage", label: "Affected Population", href: "/barangay/affected" },
        { icon: "fas fa-hands-helping", label: "Assistance Tracking", href: "/barangay/assistance" },
        { icon: "fas fa-chart-bar", label: "Barangay Analytics", href: "/barangay/analytics" }
      ]
    },
    {
      heading: "Reports",
      items: [
        { icon: "fas fa-file-alt", label: "Generate Reports", href: "/barangay/reports" },
        { icon: "fas fa-print", label: "Print Forms", href: "/barangay/print" }
      ]
    }
  ];

  // Choose menu based on role
  const menuItems = isAdmin ? adminMenuItems : barangayMenuItems;

  const renderMenuSection = (section, index) => (
    <React.Fragment key={index}>
      <div className="sb-sidenav-menu-heading">{section.heading}</div>
      {section.items.map((item, itemIndex) => (
        <a key={itemIndex} className="nav-link" href={item.href}>
          <div className="sb-nav-link-icon">
            <i className={item.icon}></i>
          </div>
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className="badge bg-danger ms-2">{item.badge}</span>
          )}
        </a>
      ))}
    </React.Fragment>
  );

  return (
    <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">
          {menuItems.map(renderMenuSection)}
          
          {/* Common Settings for All Roles */}
          <div className="sb-sidenav-menu-heading">Settings</div>
          <a className="nav-link" href="/profile">
            <div className="sb-nav-link-icon">
              <i className="fas fa-user"></i>
            </div>
            Profile
          </a>
          <a className="nav-link" href="/settings">
            <div className="sb-nav-link-icon">
              <i className="fas fa-cog"></i>
            </div>
            Settings
          </a>
        </div>
      </div>
      
      <div className="sb-sidenav-footer">
        <div className="small">Logged in as:</div>
        <span className="user-name">{user?.name || 'User'}</span>
        <div className="small text-muted">
          {isAdmin ? 'Municipal Admin' : user?.barangay_name}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;