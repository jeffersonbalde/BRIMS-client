// pages/barangay/GenerateReports.jsx - FIXED WITH ALL REPORT TYPES
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showToast } from "../../../services/notificationService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const GenerateReports = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ 
    type: 'population_detailed', 
    date_from: '', 
    date_to: '',
    barangay: user?.barangay_name || '',
    incident_type: 'all'
  });
  const [reportData, setReportData] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState('all');

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/reports/incidents-dropdown`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barangay: user?.barangay_name,
          incident_type: filters.incident_type
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setIncidents(data.incidents || []);
      } else {
        throw new Error(data.message || 'Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      showToast.error('Failed to load incidents list');
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    
    try {
      let endpoint = '/reports/population-detailed';
      let requestBody = {
        date_from: filters.date_from,
        date_to: filters.date_to,
        barangay: user?.barangay_name,
        incident_type: filters.incident_type
      };

      // Set different endpoints based on report type
      switch(filters.type) {
        case 'incidents':
          endpoint = '/reports/incidents';
          break;
        case 'summary':
          endpoint = '/reports/summary';
          break;
        case 'population_detailed':
        default:
          endpoint = '/reports/population-detailed';
          if (selectedIncident !== 'all') {
            requestBody.incident_id = selectedIncident;
          }
          break;
      }

      console.log('🔄 Generating report:', { endpoint, requestBody });

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}${endpoint}`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Report API response:', data);
      
      if (data.success) {
        setReportData(data.data);
        showToast.success(`${getReportTypeLabel()} generated successfully`);
      } else {
        throw new Error(data.message || 'Unknown error from server');
      }

    } catch (error) {
      console.error('Report generation error:', error);
      showToast.error('Failed to generate report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Export different PDFs based on report type
  const exportToPDF = async () => {
    if (!reportData) return;
    
    try {
      switch(filters.type) {
        case 'incidents':
          await exportIncidentsPDF();
          break;
        case 'summary':
          await exportSummaryPDF();
          break;
        case 'population_detailed':
        default:
          await exportPopulationDetailedPDF();
          break;
      }
    } catch (error) {
      console.error('PDF export error:', error);
      showToast.error('Failed to export PDF');
    }
  };

  const exportPopulationDetailedPDF = async () => {
    const doc = new jsPDF();
    const reportType = getReportTypeLabel();
    const dateRange = getDateRangeText();
    const generatedDate = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    
    let title = `${user?.barangay_name} ${reportType} REPORT`;
    if (filters.type === 'population_detailed' && selectedIncident !== 'all' && reportData.selected_incident) {
      title = `${user?.barangay_name} - ${reportData.selected_incident.title} - POPULATION REPORT`;
    }
    
    doc.text(title, 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${generatedDate}`, 14, 25);
    doc.text(`Date Range: ${dateRange}`, 14, 32);

    let startY = 40;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('POPULATION AFFECTED SUMMARY', 14, startY);
    
    const populationData = [
      ['No. of Families', reportData.population_affected?.no_of_families || 0],
      ['No. of Persons', reportData.population_affected?.no_of_persons || 0],
      ['Displaced Families', reportData.population_affected?.displaced_families || 0],
      ['Displaced Persons', reportData.population_affected?.displaced_persons || 0],
      ['Families Requiring Assistance', reportData.population_affected?.families_requiring_assistance || 0],
      ['Families Assisted', reportData.population_affected?.families_assisted || 0],
      ['% Families Assisted', `${reportData.population_affected?.percentage_families_assisted || 0}%`],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Metric', 'Count']],
      body: populationData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
    });

    startY = doc.lastAutoTable.finalY + 10;
    doc.text('GENDER BREAKDOWN', 14, startY);
    
    const genderData = [
      ['Male', reportData.gender_breakdown?.male || 0],
      ['Female', reportData.gender_breakdown?.female || 0],
      ['LGBTQIA+ / Other', reportData.gender_breakdown?.lgbtqia || 0],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Gender', 'Count']],
      body: genderData,
      theme: 'grid',
    });

    startY = doc.lastAutoTable.finalY + 10;
    doc.text('CIVIL STATUS', 14, startY);
    
    const civilStatusData = [
      ['Single', reportData.civil_status?.single || 0],
      ['Married', reportData.civil_status?.married || 0],
      ['Widowed', reportData.civil_status?.widowed || 0],
      ['Separated', reportData.civil_status?.separated || 0],
      ['Live-In/Cohabiting', reportData.civil_status?.live_in || 0],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Civil Status', 'Count']],
      body: civilStatusData,
      theme: 'grid',
    });

    startY = doc.lastAutoTable.finalY + 10;
    doc.text('VULNERABLE GROUPS', 14, startY);
    
    const vulnerableData = Object.entries(reportData.vulnerable_groups || {}).map(([key, value]) => [
      key.replace(/_/g, ' ').replace('4ps', '4Ps').replace(/\b\w/g, l => l.toUpperCase()),
      value
    ]);

    autoTable(doc, {
      startY: startY + 5,
      head: [['Vulnerable Group', 'Count']],
      body: vulnerableData,
      theme: 'grid',
    });

    startY = doc.lastAutoTable.finalY + 10;
    doc.text('AGE CATEGORIES', 14, startY);
    
    const ageData = [
      ['Infant (0-6 mos)', reportData.age_categories?.infant || 0],
      ['Toddlers (7 mos-2 y/o)', reportData.age_categories?.toddlers || 0],
      ['Preschooler (3-5 y/o)', reportData.age_categories?.preschooler || 0],
      ['School Age (6-12 y/o)', reportData.age_categories?.school_age || 0],
      ['Teen Age (13-17 y/o)', reportData.age_categories?.teen_age || 0],
      ['Adult (18-59 y/o)', reportData.age_categories?.adult || 0],
      ['Elderly (60 and above)', reportData.age_categories?.elderly_age || 0],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Age Category', 'Count']],
      body: ageData,
      theme: 'grid',
    });

    startY = doc.lastAutoTable.finalY + 10;
    doc.text('CASUALTIES', 14, startY);
    
    const casualtyData = [
      ['Dead', reportData.casualties?.dead || 0],
      ['Injured/Ill', reportData.casualties?.injured_ill || 0],
      ['Missing', reportData.casualties?.missing || 0],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Casualty Type', 'Count']],
      body: casualtyData,
      theme: 'grid',
    });

    if (reportData.incident_types && Object.keys(reportData.incident_types).length > 0) {
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('INCIDENT TYPES SUMMARY', 14, startY);
      
      const incidentTypeData = Object.entries(reportData.incident_types).map(([type, count]) => [type, count]);
      
      autoTable(doc, {
        startY: startY + 5,
        head: [['Incident Type', 'Count']],
        body: incidentTypeData,
        theme: 'grid',
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`${user?.barangay_name}_${reportType.replace(/\s+/g, '_')}_Report.pdf`);
    showToast.success('PDF exported successfully');
  };

  // NEW: Export Incidents Report PDF
  const exportIncidentsPDF = async () => {
    const doc = new jsPDF();
    const reportType = getReportTypeLabel();
    const dateRange = getDateRangeText();
    const generatedDate = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text(`${user?.barangay_name} INCIDENTS REPORT`, 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${generatedDate}`, 14, 25);
    doc.text(`Date Range: ${dateRange}`, 14, 32);

    let startY = 45;

    // Incident Summary
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('INCIDENT SUMMARY', 14, startY);
    
    const summaryData = [
      ['Total Incidents', reportData.total_incidents || 0],
      ['Active Incidents', reportData.active_incidents || 0],
      ['Resolved Incidents', reportData.resolved_incidents || 0],
      ['High/Critical Incidents', reportData.high_critical_incidents || 0],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Metric', 'Count']],
      body: summaryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
    });

    // Incident Types Breakdown
    startY = doc.lastAutoTable.finalY + 10;
    doc.text('INCIDENT TYPES BREAKDOWN', 14, startY);
    
    const incidentTypesData = Object.entries(reportData.incident_types || {}).map(([type, count]) => [type, count]);

    autoTable(doc, {
      startY: startY + 5,
      head: [['Incident Type', 'Count']],
      body: incidentTypesData,
      theme: 'grid',
    });

    // Recent Incidents List
    if (reportData.recent_incidents && reportData.recent_incidents.length > 0) {
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('RECENT INCIDENTS', 14, startY);
      
      const incidentsData = reportData.recent_incidents.map(incident => [
        incident.title,
        incident.incident_type,
        new Date(incident.incident_date).toLocaleDateString(),
        incident.status
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Title', 'Type', 'Date', 'Status']],
        body: incidentsData,
        theme: 'grid',
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`${user?.barangay_name}_Incidents_Report.pdf`);
    showToast.success('Incidents PDF exported successfully');
  };

  // NEW: Export Summary Report PDF
  const exportSummaryPDF = async () => {
    const doc = new jsPDF();
    const reportType = getReportTypeLabel();
    const dateRange = getDateRangeText();
    const generatedDate = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text(`${user?.barangay_name} SUMMARY REPORT`, 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${generatedDate}`, 14, 25);
    doc.text(`Date Range: ${dateRange}`, 14, 32);

    let startY = 45;

    // Overall Summary
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('OVERALL SUMMARY', 14, startY);
    
    const summaryData = [
      ['Total Incidents', reportData.total_incidents || 0],
      ['Total Families Affected', reportData.total_families || 0],
      ['Total Persons Affected', reportData.total_persons || 0],
      ['Resolution Rate', `${reportData.resolution_rate || 0}%`],
    ];

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
    });

    // Key Statistics
    startY = doc.lastAutoTable.finalY + 10;
    doc.text('KEY STATISTICS', 14, startY);
    
    const statsData = [
      ['Displaced Families', reportData.displaced_families || 0],
      ['Displaced Persons', reportData.displaced_persons || 0],
      ['Families Assisted', reportData.families_assisted || 0],
      ['Assistance Coverage', `${reportData.assistance_coverage || 0}%`],
    ];

    autoTable(doc, {
      startY: startY + 5,
      head: [['Statistic', 'Count']],
      body: statsData,
      theme: 'grid',
    });

    // Incident Overview
    if (reportData.incident_overview) {
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('INCIDENT OVERVIEW', 14, startY);
      
      const overviewData = Object.entries(reportData.incident_overview).map(([type, data]) => [
        type,
        data.count || 0,
        data.families || 0,
        data.persons || 0
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Incident Type', 'Count', 'Families', 'Persons']],
        body: overviewData,
        theme: 'grid',
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`${user?.barangay_name}_Summary_Report.pdf`);
    showToast.success('Summary PDF exported successfully');
  };

  const getReportTypeLabel = () => {
    switch(filters.type) {
      case 'population_detailed': return 'Detailed Population';
      case 'incidents': return 'Incidents';
      case 'summary': return 'Summary';
      default: return 'Report';
    }
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

  // NEW: Render different report types
  const renderReport = () => {
    if (!reportData) return null;

    switch(filters.type) {
      case 'incidents':
        return renderIncidentsReport();
      case 'summary':
        return renderSummaryReport();
      case 'population_detailed':
      default:
        return renderPopulationDetailedReport();
    }
  };

  // NEW: Render Incidents Report
  const renderIncidentsReport = () => {
    return (
      <div className="row g-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">Incident Summary</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-primary">{reportData.total_incidents || 0}</h4>
                    <small className="text-muted">Total Incidents</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.active_incidents || 0}</h4>
                    <small className="text-muted">Active Incidents</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-success">{reportData.resolved_incidents || 0}</h4>
                    <small className="text-muted">Resolved Incidents</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-danger">{reportData.high_critical_incidents || 0}</h4>
                    <small className="text-muted">High/Critical</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">Incident Types</h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {Object.entries(reportData.incident_types || {}).map(([type, count]) => (
                  <div key={type} className="col-12">
                    <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                      <span>{type}</span>
                      <strong className="text-primary">{count}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">Recent Incidents</h6>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {reportData.recent_incidents && reportData.recent_incidents.map((incident, index) => (
                  <div key={index} className="list-group-item">
                    <h6 className="mb-1">{incident.title}</h6>
                    <p className="mb-1 small text-muted">
                      {incident.incident_type} • {new Date(incident.incident_date).toLocaleDateString()}
                    </p>
                    <span className={`badge ${
                      incident.status === 'Resolved' ? 'bg-success' : 
                      incident.status === 'Investigating' ? 'bg-warning' : 'bg-primary'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Render Summary Report
  const renderSummaryReport = () => {
    return (
      <div className="row g-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">Overall Summary</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-primary">{reportData.total_incidents || 0}</h4>
                    <small className="text-muted">Total Incidents</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-info">{reportData.total_families || 0}</h4>
                    <small className="text-muted">Families Affected</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-info">{reportData.total_persons || 0}</h4>
                    <small className="text-muted">Persons Affected</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-success">{reportData.resolution_rate || 0}%</h4>
                    <small className="text-muted">Resolution Rate</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">Key Statistics</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.displaced_families || 0}</h4>
                    <small className="text-muted">Displaced Families</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.displaced_persons || 0}</h4>
                    <small className="text-muted">Displaced Persons</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-success">{reportData.families_assisted || 0}</h4>
                    <small className="text-muted">Families Assisted</small>
                  </div>
                </div>
                <div className="col-12">
                  <div className="border rounded p-3 text-center bg-light">
                    <h4 className="text-success">{reportData.assistance_coverage || 0}%</h4>
                    <small className="text-muted">Assistance Coverage Rate</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {reportData.incident_overview && (
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">Incident Overview</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Incident Type</th>
                        <th>Count</th>
                        <th>Families Affected</th>
                        <th>Persons Affected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reportData.incident_overview).map(([type, data]) => (
                        <tr key={type}>
                          <td>{type}</td>
                          <td><strong>{data.count || 0}</strong></td>
                          <td>{data.families || 0}</td>
                          <td>{data.persons || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Keep the existing renderPopulationDetailedReport function (it's the same as before)
  const renderPopulationDetailedReport = () => {
    // ... (keep the existing implementation exactly as it was)
    if (!reportData) return null;

    return (
      <div className="row g-4">
        {selectedIncident !== 'all' && reportData.selected_incident && (
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h5 className="card-title mb-1">{reportData.selected_incident.title}</h5>
                <p className="card-text text-muted mb-0">
                  Incident Date: {new Date(reportData.selected_incident.incident_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">Population Affected</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-primary">{reportData.population_affected?.no_of_families || 0}</h4>
                    <small className="text-muted">No. of Families</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-primary">{reportData.population_affected?.no_of_persons || 0}</h4>
                    <small className="text-muted">No. of Persons</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.population_affected?.displaced_families || 0}</h4>
                    <small className="text-muted">Displaced Families</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.population_affected?.displaced_persons || 0}</h4>
                    <small className="text-muted">Displaced Persons</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-info">{reportData.population_affected?.families_requiring_assistance || 0}</h4>
                    <small className="text-muted">Families Requiring Assistance</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-success">{reportData.population_affected?.families_assisted || 0}</h4>
                    <small className="text-muted">Families Assisted</small>
                  </div>
                </div>
                <div className="col-12">
                  <div className="border rounded p-3 text-center bg-light">
                    <h4 className="text-success">{reportData.population_affected?.percentage_families_assisted || 0}%</h4>
                    <small className="text-muted">Percentage of Families Assisted</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ... rest of the existing population detailed report code ... */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">Gender Breakdown</h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>Male</span>
                    <strong className="text-primary">{reportData.gender_breakdown?.male || 0}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>Female</span>
                    <strong className="text-primary">{reportData.gender_breakdown?.female || 0}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span>LGBTQIA+ / Other</span>
                    <strong className="text-primary">{reportData.gender_breakdown?.lgbtqia || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">Civil Status</h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>Single</span>
                    <strong className="text-primary">{reportData.civil_status?.single || 0}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>Married</span>
                    <strong className="text-primary">{reportData.civil_status?.married || 0}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>Widowed</span>
                    <strong className="text-primary">{reportData.civil_status?.widowed || 0}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>Separated</span>
                    <strong className="text-primary">{reportData.civil_status?.separated || 0}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <span>Live-In/Cohabiting</span>
                    <strong className="text-primary">{reportData.civil_status?.live_in || 0}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">Vulnerable Groups</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {Object.entries(reportData.vulnerable_groups || {}).map(([key, value]) => (
                  <div key={key} className="col-md-4 col-sm-6">
                    <div className="border rounded p-3 text-center">
                      <h5 className="text-primary mb-1">{value}</h5>
                      <small className="text-muted text-capitalize">
                        {key.replace(/_/g, ' ')
                            .replace('4ps', '4Ps')
                            .replace('gbv', 'GBV')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">Age Categories</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {Object.entries(reportData.age_categories || {}).map(([key, value]) => (
                  <div key={key} className="col-md-4 col-sm-6">
                    <div className="border rounded p-3 text-center">
                      <h5 className="text-primary mb-1">{value}</h5>
                      <small className="text-muted text-capitalize">
                        {key.replace(/_/g, ' ').replace('age', '').trim()}
                        {key === 'infant' && ' (0-6 mos)'}
                        {key === 'toddlers' && ' (7 mos-2 y/o)'}
                        {key === 'preschooler' && ' (3-5 y/o)'}
                        {key === 'school_age' && ' (6-12 y/o)'}
                        {key === 'teen_age' && ' (13-17 y/o)'}
                        {key === 'adult' && ' (18-59 y/o)'}
                        {key === 'elderly_age' && ' (60 and above)'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h6 className="mb-0">Casualties</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-danger">{reportData.casualties?.dead || 0}</h4>
                    <small className="text-muted">Dead</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.casualties?.injured_ill || 0}</h4>
                    <small className="text-muted">Injured/Ill</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-info">{reportData.casualties?.missing || 0}</h4>
                    <small className="text-muted">Missing</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (filters.type === 'population_detailed') {
      fetchIncidents();
    }
  }, [filters.type]);

  return (
    <div className="container-fluid px-1 fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 text-dark">Generate Reports</h1>
          <p className="text-muted mb-0">Reports for {user?.barangay_name}</p>
        </div>
      </div>

      <div className="card shadow border-0 mb-4">
        <div className="card-header py-3" style={{
          backgroundColor: "var(--primary-color)",
          background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
        }}>
          <h6 className="card-title mb-0 text-white">
            <i className="fas fa-filter me-2"></i>
            Report Configuration
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Report Type</label>
              <select 
                className="form-select form-select-sm"
                value={filters.type}
                onChange={(e) => {
                  setFilters({...filters, type: e.target.value});
                  setReportData(null);
                  setSelectedIncident('all');
                }}
              >
                <option value="population_detailed">Detailed Population Report</option>
                <option value="incidents">Incidents Report</option>
                <option value="summary">Summary Report</option>
              </select>
            </div>

            {filters.type === 'population_detailed' && (
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Select Incident</label>
                <select 
                  className="form-select form-select-sm"
                  value={selectedIncident}
                  onChange={(e) => {
                    setSelectedIncident(e.target.value);
                    setReportData(null);
                  }}
                >
                  <option value="all">All Incidents</option>
                  {incidents.map(incident => (
                    <option key={incident.id} value={incident.id}>
                      {incident.title} - {new Date(incident.incident_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                <small className="text-muted">
                  Choose "All Incidents" for aggregated data or select a specific incident
                </small>
              </div>
            )}

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Date From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.date_from}
                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Date To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.date_to}
                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-3 d-flex gap-2 flex-wrap">
            <button 
              className="btn btn-primary btn-sm"
              onClick={generateReport}
              disabled={loading}
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
                disabled={loading}
              >
                <i className="fas fa-file-pdf me-2"></i>
                Export PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {reportData && (
        <div className="card shadow border-0">
          <div className="card-header py-3" style={{
            backgroundColor: "var(--primary-color)",
            background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
          }}>
            <h6 className="card-title mb-0 text-white">
              <i className="fas fa-chart-bar me-2"></i>
              {getReportTypeLabel()} Report - {getDateRangeText()}
              {filters.type === 'population_detailed' && selectedIncident !== 'all' && reportData.selected_incident && (
                <span className="ms-2">- {reportData.selected_incident.title}</span>
              )}
            </h6>
          </div>

          <div className="card-body">
            {renderReport()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateReports;