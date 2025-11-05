// pages/admin/MunicipalReports.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showToast } from "../../../services/notificationService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


const MunicipalReports = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionLock, setActionLock] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    type: 'incidents',
    date_from: '',
    date_to: ''
  });
  const [reportData, setReportData] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    investigating: 0,
    reported: 0,
  });

  useEffect(() => {
    if (reportData) {
      calculateStats();
    }
  }, [reportData]);

  const calculateStats = () => {
    if (!reportData) return;

    let statsData = { total: 0, resolved: 0, investigating: 0, reported: 0 };

    if (filters.type === 'incidents' && reportData.incidents) {
      statsData = {
        total: reportData.summary?.total || 0,
        resolved: reportData.summary?.by_status?.Resolved || 0,
        investigating: reportData.summary?.by_status?.Investigating || 0,
        reported: reportData.summary?.by_status?.Reported || 0,
      };
    } else if (filters.type === 'population' && reportData.population_data) {
      statsData = {
        total: reportData.summary?.total_records || 0,
        resolved: reportData.summary?.total_families_assisted || 0,
        investigating: reportData.summary?.total_displaced || 0,
        reported: reportData.summary?.total_population || 0,
      };
    } else if (filters.type === 'infrastructure' && reportData.infrastructure_data) {
      statsData = {
        total: reportData.summary?.total_records || 0,
        resolved: reportData.summary?.communication_issues || 0,
        investigating: reportData.summary?.power_outages || 0,
        reported: reportData.summary?.roads_affected || 0,
      };
    }

    setStats(statsData);
  };

  const generateReport = async () => {
    if (actionLock) {
      showToast.warning("Please wait until the current action completes");
      return;
    }

    setActionLock(true);
    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/reports/municipal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
        setCurrentPage(1);
        showToast.success('Report generated successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      showToast.error('Failed to generate report: ' + error.message);
    } finally {
      setLoading(false);
      setActionLock(false);
    }
  };

const exportToPDF = async () => {
  if (!reportData) {
    showToast.error('No report data available to export');
    return;
  }

  if (actionLock) {
    showToast.warning("Please wait until the current action completes");
    return;
  }

  setActionLock(true);
  setExportLoading(true);

  try {
    const doc = new jsPDF();
    const reportType = filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
    const dateRange = getDateRangeText();
    const generatedDate = new Date().toLocaleString();

    // Title and Header
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text(`MUNICIPAL ${reportType.toUpperCase()} REPORT`, 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${generatedDate}`, 14, 25);
    doc.text(`Date Range: ${dateRange}`, 14, 32);
    doc.text(`Total Records: ${stats.total}`, 14, 39);

    let startY = 50;

    // Summary Statistics Table
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('SUMMARY STATISTICS', 14, startY);

    const summaryData = getSummaryData();
    
    // Use autoTable directly - it's automatically available after import
    autoTable(doc, {
      startY: startY + 5,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { fontSize: 10 },
      margin: { top: 10 }
    });

    // Detailed Data Table
    const data = getFilteredData();
    if (data.length > 0) {
      startY = doc.lastAutoTable.finalY + 15;
      doc.text('DETAILED REPORT DATA', 14, startY);

      const tableData = getTableDataForPDF(data);
      const headers = getTableHeaders();

      autoTable(doc, {
        startY: startY + 5,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [52, 152, 219],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: getColumnStyles(),
        pageBreak: 'auto',
        margin: { top: 10 }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      doc.text(`Municipal Reporting System - Confidential`, 105, 290, { align: 'center' });
    }

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    doc.save(`Municipal_${reportType}_Report_${timestamp}.pdf`);
    
    showToast.success('PDF exported successfully');
  } catch (error) {
    console.error('PDF export error:', error);
    showToast.error('Failed to export PDF: ' + error.message);
  } finally {
    setExportLoading(false);
    setActionLock(false);
  }
};

  const getSummaryData = () => {
    if (filters.type === 'incidents') {
      return [
        ['Total Incidents', stats.total],
        ['Resolved', stats.resolved],
        ['Investigating', stats.investigating],
        ['Reported', stats.reported],
        ['Resolution Rate', `${((stats.resolved / stats.total) * 100).toFixed(1)}%`]
      ];
    } else if (filters.type === 'population') {
      return [
        ['Total Records', stats.total],
        ['Total Population', stats.reported],
        ['Displaced Persons', stats.investigating],
        ['Families Assisted', stats.resolved],
        ['Assistance Coverage', `${((stats.resolved / stats.investigating) * 100).toFixed(1)}%`]
      ];
    } else if (filters.type === 'infrastructure') {
      return [
        ['Total Records', stats.total],
        ['Roads Affected', stats.reported],
        ['Power Outages', stats.investigating],
        ['Communication Issues', stats.resolved]
      ];
    }
    return [];
  };

  const getTableDataForPDF = (data) => {
    return data.map(item => {
      if (filters.type === 'incidents') {
        return [
          item.title || 'N/A',
          item.incident_type || 'N/A',
          item.reporter?.barangay_name || 'Unknown',
          item.status || 'N/A',
          item.incident_date ? new Date(item.incident_date).toLocaleDateString() : 'N/A',
          new Date(item.created_at).toLocaleDateString()
        ];
      } else if (filters.type === 'population') {
        return [
          item.incident_title || 'No Title',
          item.incident_type || 'Unknown',
          item.barangay_name || 'Unknown',
          formatNumber(item.total_population),
          formatNumber(item.displaced_persons),
          formatNumber(item.families_assisted),
          formatNumber(item.pwd_count || 0),
          formatNumber(item.elderly_count || 0),
          formatNumber(item.pregnant_count || 0)
        ];
      } else if (filters.type === 'infrastructure') {
        return [
          item.incident_title || 'No Title',
          item.incident_type || 'Unknown',
          item.barangay_name || 'Unknown',
          item.roads_bridges_status || 'Normal',
          item.power_outage_time ? 'Yes' : 'No',
          item.communication_interruption_time ? 'Yes' : 'No',
          item.roads_remarks || 'No remarks',
          item.power_remarks || 'No remarks'
        ];
      }
      return [];
    });
  };

  const getTableHeaders = () => {
    if (filters.type === 'incidents') {
      return ['Title', 'Type', 'Barangay', 'Status', 'Incident Date', 'Reported Date'];
    } else if (filters.type === 'population') {
      return ['Incident', 'Type', 'Barangay', 'Population', 'Displaced', 'Families', 'PWD', 'Elderly', 'Pregnant'];
    } else if (filters.type === 'infrastructure') {
      return ['Incident', 'Type', 'Barangay', 'Roads Status', 'Power Outage', 'Comm Issues', 'Roads Remarks', 'Power Remarks'];
    }
    return [];
  };

  const getColumnStyles = () => {
    if (filters.type === 'incidents') {
      return { 0: { cellWidth: 40 }, 1: { cellWidth: 25 }, 2: { cellWidth: 25 }, 3: { cellWidth: 20 }, 4: { cellWidth: 25 }, 5: { cellWidth: 25 } };
    } else if (filters.type === 'population') {
      return { 0: { cellWidth: 30 }, 1: { cellWidth: 20 }, 2: { cellWidth: 25 }, 3: { cellWidth: 15 }, 4: { cellWidth: 15 }, 5: { cellWidth: 15 }, 6: { cellWidth: 10 }, 7: { cellWidth: 10 }, 8: { cellWidth: 10 } };
    } else if (filters.type === 'infrastructure') {
      return { 0: { cellWidth: 30 }, 1: { cellWidth: 20 }, 2: { cellWidth: 25 }, 3: { cellWidth: 20 }, 4: { cellWidth: 15 }, 5: { cellWidth: 15 }, 6: { cellWidth: 25 }, 7: { cellWidth: 25 } };
    }
    return {};
  };

  const getDateRangeText = () => {
    if (filters.date_from && filters.date_to) {
      return `${filters.date_from} to ${filters.date_to}`;
    } else if (filters.date_from) {
      return `From ${filters.date_from}`;
    } else if (filters.date_to) {
      return `Until ${filters.date_to}`;
    }
    return 'All Dates';
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 0;
    return num;
  };

  const getFilteredData = () => {
    if (!reportData) return [];

    let data = [];
    if (filters.type === 'incidents' && reportData.incidents) {
      data = reportData.incidents;
    } else if (filters.type === 'population' && reportData.population_data) {
      data = reportData.population_data;
    } else if (filters.type === 'infrastructure' && reportData.infrastructure_data) {
      data = reportData.infrastructure_data;
    }

    if (searchTerm) {
      data = data.filter(item => 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return data;
  };

  const getSortedData = (data) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField.includes('date') || sortField.includes('created_at') || sortField.includes('time')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
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

  const isActionDisabled = () => {
    return actionLock || loading;
  };

  // Pagination
  const filteredData = getFilteredData();
  const sortedData = getSortedData(filteredData);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Skeleton Loaders
  const TableRowSkeleton = () => (
    <tr className="align-middle">
      <td className="text-center">
        <div className="skeleton-box" style={{ width: "20px", height: "20px", margin: "0 auto" }}></div>
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
      <td>
        <div className="skeleton-badge"></div>
      </td>
      <td>
        <div className="skeleton-line" style={{ width: "70%" }}></div>
      </td>
      <td className="text-center">
        <div className="skeleton-line" style={{ width: "80%", margin: "0 auto" }}></div>
      </td>
    </tr>
  );

  const StatsCardSkeleton = () => (
    <div className="col-6 col-md-3">
      <div className="card border-left-primary shadow-sm h-100">
        <div className="card-body p-3">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <div className="skeleton-line mb-2" style={{ width: "80%", height: "12px" }}></div>
              <div className="skeleton-line" style={{ width: "50%", height: "20px" }}></div>
            </div>
            <div className="col-auto">
              <div className="skeleton-avatar" style={{ width: "30px", height: "30px" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
      return "Time Error";
    }
  };

  return (
    <div className="container-fluid px-1">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h1 className="h3 mb-1 text-dark">Municipal Reports</h1>
          <p className="text-muted mb-0">Generate comprehensive reports and analytics for municipal data</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="badge px-3 py-2 text-white" style={{
            backgroundColor: "var(--primary-color)",
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
          }}>
            <i className="fas fa-file-alt me-2"></i>
            <span className="d-none d-sm-inline">Report Type:</span>
            <span> {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={generateReport}
            disabled={isActionDisabled()}
            style={{
              backgroundColor: "var(--btn-primary-bg)",
              borderColor: "var(--btn-primary-bg)",
            }}
          >
            <i className="fas fa-sync-alt me-1"></i>
            <span className="d-none d-sm-inline">Refresh</span>
            <span className="d-sm-none">Refresh</span>
          </button>
        </div>
      </div>

      {/* Report Filters */}
      <div className="card shadow border-0 mb-4">
        <div className="card-header py-3" style={{
          backgroundColor: "var(--primary-color)",
          background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
        }}>
          <h6 className="card-title mb-0 text-white">
            <i className="fas fa-filter me-2"></i>
            Report Filters
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Report Type</label>
              <select 
                className="form-select form-select-sm"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                disabled={isActionDisabled()}
              >
                <option value="incidents">Incidents Report</option>
                <option value="population">Population Data Report</option>
                <option value="infrastructure">Infrastructure Report</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Date From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.date_from}
                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                disabled={isActionDisabled()}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Date To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.date_to}
                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                disabled={isActionDisabled()}
              />
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button 
              className="btn btn-primary btn-sm"
              onClick={generateReport}
              disabled={isActionDisabled()}
              style={{
                backgroundColor: "var(--btn-primary-bg)",
                borderColor: "var(--btn-primary-bg)",
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-file-alt me-2"></i>
                  Generate Report
                </>
              )}
            </button>
            
            {reportData && (
              <button 
                className="btn btn-success btn-sm"
                onClick={exportToPDF}
                disabled={isActionDisabled() || exportLoading}
              >
                {exportLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download me-2"></i>
                    Export PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {reportData && (
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
                          Total Records
                        </div>
                        <div className="h4 mb-0 fw-bold" style={{ color: "var(--primary-color)" }}>
                          {stats.total}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-list fa-lg" style={{ color: "var(--primary-light)", opacity: 0.7 }}></i>
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
                          {filters.type === 'incidents' ? 'Resolved' : 
                           filters.type === 'population' ? 'Families Assisted' : 'Comm Issues'}
                        </div>
                        <div className="h4 mb-0 fw-bold" style={{ color: "#198754" }}>
                          {stats.resolved}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-check-circle fa-lg" style={{ color: "#198754", opacity: 0.7 }}></i>
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
                          {filters.type === 'incidents' ? 'Investigating' : 
                           filters.type === 'population' ? 'Displaced Persons' : 'Power Outages'}
                        </div>
                        <div className="h4 mb-0 fw-bold" style={{ color: "#17a2b8" }}>
                          {stats.investigating}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-search fa-lg" style={{ color: "#17a2b8", opacity: 0.7 }}></i>
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
                          {filters.type === 'incidents' ? 'Reported' : 
                           filters.type === 'population' ? 'Total Population' : 'Roads Affected'}
                        </div>
                        <div className="h4 mb-0 fw-bold" style={{ color: "#ffc107" }}>
                          {stats.reported}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-chart-bar fa-lg" style={{ color: "#ffc107", opacity: 0.7 }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search and Filter Controls */}
      {reportData && (
        <div className="card shadow border-0 mb-4">
          <div className="card-body p-3">
            <div className="row g-2 g-md-3 align-items-end">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold mb-1">Search Records</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search records..."
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
                <label className="form-label small fw-semibold mb-1">Items</label>
                <select
                  className="form-select form-select-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  disabled={isActionDisabled()}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>

              <div className="col-6 col-md-3">
                <div className="text-center text-md-end">
                  <small className="text-muted">
                    Showing <span className="fw-semibold">{Math.min(sortedData.length, 1)}-{Math.min(endIndex, sortedData.length)}</span> of{" "}
                    <span className="fw-semibold">{sortedData.length}</span> records
                    {searchTerm && " (filtered)"}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Results */}
      {reportData && (
        <div className="card shadow border-0">
          <div className="card-header py-3" style={{
            backgroundColor: "var(--primary-color)",
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
          }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <h6 className="card-title mb-0 text-white">
                <i className="fas fa-chart-bar me-2"></i>
                Report Results - {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Report
                {!loading && (
                  <small className="opacity-75 ms-2">
                    ({sortedData.length} records{searchTerm ? " after filtering" : ""})
                  </small>
                )}
              </h6>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={generateReport}
                  disabled={isActionDisabled()}
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
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead style={{ backgroundColor: "var(--background-light)" }}>
                    <tr>
                      <th className="text-center fw-bold" style={{ width: "50px", fontSize: "0.875rem" }}>#</th>
                      {filters.type === 'incidents' && (
                        <>
                          <th style={{ fontSize: "0.875rem" }}>Title</th>
                          <th style={{ fontSize: "0.875rem" }}>Type</th>
                          <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                          <th style={{ fontSize: "0.875rem" }}>Status</th>
                          <th style={{ fontSize: "0.875rem" }}>Incident Date</th>
                          <th style={{ fontSize: "0.875rem" }}>Date Reported</th>
                        </>
                      )}
                      {filters.type === 'population' && (
                        <>
                          <th style={{ fontSize: "0.875rem" }}>Incident Title</th>
                          <th style={{ fontSize: "0.875rem" }}>Type</th>
                          <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                          <th style={{ fontSize: "0.875rem" }}>Incident Date</th>
                          <th style={{ fontSize: "0.875rem" }}>Population</th>
                          <th style={{ fontSize: "0.875rem" }}>Displaced</th>
                          <th style={{ fontSize: "0.875rem" }}>Families Assisted</th>
                        </>
                      )}
                      {filters.type === 'infrastructure' && (
                        <>
                          <th style={{ fontSize: "0.875rem" }}>Incident Title</th>
                          <th style={{ fontSize: "0.875rem" }}>Type</th>
                          <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                          <th style={{ fontSize: "0.875rem" }}>Incident Date</th>
                          <th style={{ fontSize: "0.875rem" }}>Roads Status</th>
                          <th style={{ fontSize: "0.875rem" }}>Power Outage</th>
                          <th style={{ fontSize: "0.875rem" }}>Communication</th>
                        </>
                      )}
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
                  <span className="text-muted">Loading report data...</span>
                </div>
              </div>
            ) : currentData.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-search fa-4x text-muted opacity-50"></i>
                </div>
                <h5 className="text-muted mb-3">
                  {sortedData.length === 0 ? "No Data Available" : "No Matching Results"}
                </h5>
                <p className="text-muted mb-4">
                  {sortedData.length === 0 ? "No data found for the selected criteria." : "Try adjusting your search criteria."}
                </p>
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm("")}
                    disabled={isActionDisabled()}
                  >
                    <i className="fas fa-times me-2"></i>Clear Search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead style={{ backgroundColor: "var(--background-light)" }}>
                      <tr>
                        <th className="text-center fw-bold" style={{ width: "50px", fontSize: "0.875rem" }}>#</th>
                        
                        {/* Incidents Report Headers - Responsive */}
                        {filters.type === 'incidents' && (
                          <>
                            <th style={{ width: "180px", fontSize: "0.875rem" }}>
                              <button
                                className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                                onClick={() => handleSort("title")}
                                disabled={isActionDisabled()}
                              >
                                <span className="d-flex align-items-center justify-content-between">
                                  <span className="text-truncate d-none d-md-inline">Title</span>
                                  <span className="text-truncate d-md-none">Title</span>
                                  <i className={`ms-1 ${getSortIcon("title")}`}></i>
                                </span>
                              </button>
                            </th>
                            <th style={{ width: "100px", fontSize: "0.875rem" }}>
                              <button
                                className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                                onClick={() => handleSort("incident_type")}
                                disabled={isActionDisabled()}
                              >
                                <span className="d-flex align-items-center justify-content-between">
                                  <span className="text-truncate">Type</span>
                                  <i className={`ms-1 ${getSortIcon("incident_type")}`}></i>
                                </span>
                              </button>
                            </th>
                            <th style={{ width: "120px", fontSize: "0.875rem" }}>
                              <button
                                className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                                onClick={() => handleSort("reporter.barangay_name")}
                                disabled={isActionDisabled()}
                              >
                                <span className="d-flex align-items-center justify-content-between">
                                  <span className="text-truncate d-none d-sm-inline">Barangay</span>
                                  <span className="text-truncate d-sm-none">Brgy</span>
                                  <i className={`ms-1 ${getSortIcon("reporter.barangay_name")}`}></i>
                                </span>
                              </button>
                            </th>
                            <th style={{ width: "90px", fontSize: "0.875rem" }}>
                              <button
                                className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                                onClick={() => handleSort("status")}
                                disabled={isActionDisabled()}
                              >
                                <span className="d-flex align-items-center justify-content-between">
                                  <span className="text-truncate">Status</span>
                                  <i className={`ms-1 ${getSortIcon("status")}`}></i>
                                </span>
                              </button>
                            </th>
                            <th style={{ width: "130px", fontSize: "0.875rem" }}>
                              <button
                                className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                                onClick={() => handleSort("incident_date")}
                                disabled={isActionDisabled()}
                              >
                                <span className="d-flex align-items-center justify-content-between">
                                  <span className="text-truncate d-none d-lg-inline">Incident Date</span>
                                  <span className="text-truncate d-lg-none">Incident</span>
                                  <i className={`ms-1 ${getSortIcon("incident_date")}`}></i>
                                </span>
                              </button>
                            </th>
                            <th style={{ width: "130px", fontSize: "0.875rem" }}>
                              <button
                                className="btn btn-link p-0 border-0 text-decoration-none text-dark fw-semibold text-start w-100"
                                onClick={() => handleSort("created_at")}
                                disabled={isActionDisabled()}
                              >
                                <span className="d-flex align-items-center justify-content-between">
                                  <span className="text-truncate d-none d-lg-inline">Date Reported</span>
                                  <span className="text-truncate d-lg-none">Reported</span>
                                  <i className={`ms-1 ${getSortIcon("created_at")}`}></i>
                                </span>
                              </button>
                            </th>
                          </>
                        )}

                        {/* Population Data Report Headers */}
                        {filters.type === 'population' && (
                          <>
                            <th style={{ fontSize: "0.875rem" }}>Incident Title</th>
                            <th style={{ fontSize: "0.875rem" }}>Type</th>
                            <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                            <th style={{ fontSize: "0.875rem" }}>Incident Date</th>
                            <th style={{ fontSize: "0.875rem" }}>Population</th>
                            <th style={{ fontSize: "0.875rem" }}>Displaced</th>
                            <th style={{ fontSize: "0.875rem" }}>Families Assisted</th>
                          </>
                        )}

                        {/* Infrastructure Report Headers */}
                        {filters.type === 'infrastructure' && (
                          <>
                            <th style={{ fontSize: "0.875rem" }}>Incident Title</th>
                            <th style={{ fontSize: "0.875rem" }}>Type</th>
                            <th style={{ fontSize: "0.875rem" }}>Barangay</th>
                            <th style={{ fontSize: "0.875rem" }}>Incident Date</th>
                            <th style={{ fontSize: "0.875rem" }}>Roads Status</th>
                            <th style={{ fontSize: "0.875rem" }}>Power Outage</th>
                            <th style={{ fontSize: "0.875rem" }}>Communication</th>
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.map((item, index) => (
                        <tr key={item.id || index} className="align-middle">
                          <td className="text-center fw-bold text-muted" style={{ fontSize: "0.9rem" }}>
                            {startIndex + index + 1}
                          </td>

                          {/* Incidents Report Data - Responsive */}
                          {filters.type === 'incidents' && (
                            <>
                              <td style={{ width: "180px" }}>
                                <strong className="text-truncate d-block" title={item.title}>
                                  {item.title}
                                </strong>
                              </td>
                              <td style={{ width: "100px" }}>
                                <span className="text-truncate d-block" title={item.incident_type}>
                                  {item.incident_type}
                                </span>
                              </td>
                              <td style={{ width: "120px" }}>
                                <span className="text-truncate d-block" title={item.reporter?.barangay_name || 'Unknown'}>
                                  {item.reporter?.barangay_name || 'Unknown'}
                                </span>
                              </td>
                              <td style={{ width: "90px" }}>
                                <span className={`badge bg-${
                                  item.status === 'Resolved' ? 'success' :
                                  item.status === 'Investigating' ? 'warning' : 'info'
                                }`}>
                                  <span className="d-none d-sm-inline">{item.status}</span>
                                  <span className="d-sm-none">
                                    {item.status === 'Resolved' ? 'Res' : 
                                     item.status === 'Investigating' ? 'Inv' : 'Rep'}
                                  </span>
                                </span>
                              </td>
                              <td style={{ width: "130px" }}>
                                <div className="d-flex flex-column">
                                  <small className="text-truncate">
                                    {item.incident_date ? 
                                      formatLocalDate(item.incident_date) : 
                                      <span className="text-muted">N/A</span>
                                    }
                                  </small>
                                  <small className="text-muted d-none d-md-block">
                                    {item.incident_date ? formatLocalTime(item.incident_date) : ''}
                                  </small>
                                </div>
                              </td>
                              <td style={{ width: "130px" }}>
                                <div className="d-flex flex-column">
                                  <small className="text-truncate">
                                    {formatLocalDate(item.created_at)}
                                  </small>
                                  <small className="text-muted d-none d-md-block">
                                    {formatLocalTime(item.created_at)}
                                  </small>
                                </div>
                              </td>
                            </>
                          )}

                          {/* Population Data Report Data */}
                          {filters.type === 'population' && (
                            <>
                              <td>
                                <strong>{item.incident_title || 'No Title'}</strong>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {item.incident_type || 'Unknown Type'}
                                </span>
                              </td>
                              <td>
                                <strong>{item.barangay_name || 'Unknown Barangay'}</strong>
                                {item.municipality && (
                                  <>
                                    <br />
                                    <small className="text-muted">{item.municipality}</small>
                                  </>
                                )}
                              </td>
                              <td>
                                {item.incident_date ? 
                                  new Date(item.incident_date).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 
                                  item.created_at ?
                                  new Date(item.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'Unknown Date'
                                }
                              </td>
                              <td>
                                <span className={item.total_population > 0 ? "fw-bold text-primary" : "text-muted"}>
                                  {formatNumber(item.total_population)}
                                </span>
                              </td>
                              <td>
                                <span className={item.displaced_persons > 0 ? "fw-bold text-warning" : "text-muted"}>
                                  {formatNumber(item.displaced_persons)}
                                </span>
                              </td>
                              <td>
                                <span className={item.families_assisted > 0 ? "fw-bold text-success" : "text-muted"}>
                                  {formatNumber(item.families_assisted)}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Infrastructure Report Data */}
                          {filters.type === 'infrastructure' && (
                            <>
                              <td>
                                <strong>{item.incident_title || 'No Title'}</strong>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {item.incident_type || 'Unknown Type'}
                                </span>
                              </td>
                              <td>
                                <strong>{item.barangay_name || 'Unknown Barangay'}</strong>
                                {item.municipality && (
                                  <>
                                    <br />
                                    <small className="text-muted">{item.municipality}</small>
                                  </>
                                )}
                              </td>
                              <td>
                                {item.incident_date ? 
                                  new Date(item.incident_date).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 
                                  item.created_at ?
                                  new Date(item.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'Unknown Date'
                                }
                              </td>
                              <td>
                                {item.roads_bridges_status ? (
                                  <span className="badge bg-warning">{item.roads_bridges_status}</span>
                                ) : (
                                  <span className="text-muted">No issue</span>
                                )}
                                {item.roads_remarks && (
                                  <>
                                    <br />
                                    <small className="text-muted">{item.roads_remarks}</small>
                                  </>
                                )}
                              </td>
                              <td>
                                {item.power_outage_time ? (
                                  <div>
                                    <span className="badge bg-danger">Outage</span>
                                    <br />
                                    <small className="text-muted">
                                      Out: {new Date(item.power_outage_time).toLocaleString()}
                                      {item.power_restored_time && (
                                        <>
                                          <br />
                                          Restored: {new Date(item.power_restored_time).toLocaleString()}
                                        </>
                                      )}
                                    </small>
                                  </div>
                                ) : (
                                  <span className="text-muted">Normal</span>
                                )}
                              </td>
                              <td>
                                {item.communication_interruption_time ? (
                                  <div>
                                    <span className="badge bg-info">Interrupted</span>
                                    <br />
                                    <small className="text-muted">
                                      Down: {new Date(item.communication_interruption_time).toLocaleString()}
                                      {item.communication_restored_time && (
                                        <>
                                          <br />
                                          Restored: {new Date(item.communication_restored_time).toLocaleString()}
                                        </>
                                      )}
                                    </small>
                                  </div>
                                ) : (
                                  <span className="text-muted">Normal</span>
                                )}
                              </td>
                            </>
                          )}
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
                          Showing <span className="fw-semibold">{startIndex + 1}-{Math.min(endIndex, sortedData.length)}</span> of{" "}
                          <span className="fw-semibold">{sortedData.length}</span> entries
                        </small>
                      </div>

                      <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm pagination-btn"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                                if (page === 1 || page === totalPages) return true;
                                if (Math.abs(page - currentPage) <= 1) return true;
                                return false;
                              })
                              .map((page, index, array) => {
                                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                return (
                                  <React.Fragment key={page}>
                                    {showEllipsis && <span className="px-2 text-muted">...</span>}
                                    <button
                                      className={`btn btn-sm pagination-page-btn ${currentPage === page ? "active" : ""}`}
                                      onClick={() => setCurrentPage(page)}
                                      disabled={isActionDisabled()}
                                      style={
                                        currentPage === page
                                          ? {
                                              backgroundColor: "var(--btn-primary-bg)",
                                              borderColor: "var(--btn-primary-bg)",
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
                              Page <span className="fw-bold">{currentPage}</span> of <span className="fw-bold">{totalPages}</span>
                            </small>
                          </div>

                          <button
                            className="btn btn-sm pagination-btn"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isActionDisabled()}
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
      )}

      {/* Global Action Lock Overlay */}
      {(actionLock || exportLoading) && (
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
            <span className="text-muted">
              {exportLoading ? "Exporting PDF..." : "Processing action..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MunicipalReports;