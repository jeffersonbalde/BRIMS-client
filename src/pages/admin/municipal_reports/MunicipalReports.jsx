// pages/admin/MunicipalReports.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { showToast } from "../../../services/notificationService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MunicipalReports = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    barangay: 'all',
    incident_type: 'all',
    incident_id: 'all'
  });
  const [reportData, setReportData] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  const barangayOptions = [
    "BOGAYO", "BOLISONG", "BOYUGAN East", "BOYUGAN West", "BUALAN", "DIPLO",
    "GAWIL", "GUSOM", "KITAANG DAGAT", "LANTAWAN", "LIMAMAWAN", "MAHAYAHAY",
    "PANGI", "PICANAN", "POBLACION", "SALAGMANOK", "SICADE", "SUMINALOM"
  ];

  const incidentTypeOptions = ["Flood", "Landslide", "Fire", "Earthquake", "Vehicular"];

  const fetchIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/reports/incidents-dropdown`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barangay: filters.barangay,
          incident_type: filters.incident_type
        })
      });

      const data = await response.json();
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_LARAVEL_API}/reports/population-detailed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      });

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
        showToast.success('Report generated successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      showToast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!reportData) return;

    setExportLoading(true);
    try {
      const doc = new jsPDF();
      const dateRange = getDateRangeText();
      const generatedDate = new Date().toLocaleString();

      // Title and Header
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      
      let title = "MUNICIPAL POPULATION REPORT";
      if (filters.incident_id !== 'all' && reportData.selected_incident) {
        title = `${reportData.selected_incident.title} - POPULATION REPORT`;
      }
      
      doc.text(title, 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${generatedDate}`, 14, 25);
      doc.text(`Date Range: ${dateRange}`, 14, 32);

      let startY = 45;

      // Population Affected Summary
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('POPULATION AFFECTED SUMMARY', 14, startY);
      
      const populationData = [
        ['No. of Families', reportData.population_affected.no_of_families],
        ['No. of Persons', reportData.population_affected.no_of_persons],
        ['Displaced Families', reportData.population_affected.displaced_families],
        ['Displaced Persons', reportData.population_affected.displaced_persons],
        ['Families Requiring Assistance', reportData.population_affected.families_requiring_assistance],
        ['Families Assisted', reportData.population_affected.families_assisted],
        ['% Families Assisted', `${reportData.population_affected.percentage_families_assisted}%`],
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

      // Gender Breakdown
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('GENDER BREAKDOWN', 14, startY);
      
      const genderData = [
        ['Male', reportData.gender_breakdown.male],
        ['Female', reportData.gender_breakdown.female],
        ['LGBTQIA+ / Other', reportData.gender_breakdown.lgbtqia],
      ];

      autoTable(doc, {
        startY: startY + 5,
        head: [['Gender', 'Count']],
        body: genderData,
        theme: 'grid',
      });

      // Civil Status
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('CIVIL STATUS', 14, startY);
      
      const civilStatusData = [
        ['Single', reportData.civil_status.single],
        ['Married', reportData.civil_status.married],
        ['Widowed', reportData.civil_status.widowed],
        ['Separated', reportData.civil_status.separated],
        ['Live-In/Cohabiting', reportData.civil_status.live_in],
      ];

      autoTable(doc, {
        startY: startY + 5,
        head: [['Civil Status', 'Count']],
        body: civilStatusData,
        theme: 'grid',
      });

      // Vulnerable Groups
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('VULNERABLE GROUPS', 14, startY);
      
      const vulnerableData = [
        ['PWD', reportData.vulnerable_groups.pwd],
        ['Pregnant', reportData.vulnerable_groups.pregnant],
        ['Elderly', reportData.vulnerable_groups.elderly],
        ['Lactating Mother', reportData.vulnerable_groups.lactating_mother],
        ['Solo parent', reportData.vulnerable_groups.solo_parent],
        ['Indigenous People', reportData.vulnerable_groups.indigenous_people],
        ['LGBTQIA+ Persons', reportData.vulnerable_groups.lgbtqia_persons],
        ['Child-Headed Household', reportData.vulnerable_groups.child_headed_household],
        ['Victim of GBV', reportData.vulnerable_groups.victim_gbv],
        ['4Ps Beneficiaries', reportData.vulnerable_groups['4ps_beneficiaries']],
        ['Single Headed Family', reportData.vulnerable_groups.single_headed_family],
      ];

      autoTable(doc, {
        startY: startY + 5,
        head: [['Vulnerable Group', 'Count']],
        body: vulnerableData,
        theme: 'grid',
      });

      // Age Categories
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('AGE CATEGORIES', 14, startY);
      
      const ageData = [
        ['Infant (0-6 mos)', reportData.age_categories.infant],
        ['Toddlers (7 mos-2 y/o)', reportData.age_categories.toddlers],
        ['Preschooler (3-5 y/o)', reportData.age_categories.preschooler],
        ['School Age (6-12 y/o)', reportData.age_categories.school_age],
        ['Teen Age (13-17 y/o)', reportData.age_categories.teen_age],
        ['Adult (18-59 y/o)', reportData.age_categories.adult],
        ['Elderly (60+)', reportData.age_categories.elderly_age],
      ];

      autoTable(doc, {
        startY: startY + 5,
        head: [['Age Category', 'Count']],
        body: ageData,
        theme: 'grid',
      });

      // Casualties
      startY = doc.lastAutoTable.finalY + 10;
      doc.text('CASUALTIES', 14, startY);
      
      const casualtyData = [
        ['Dead', reportData.casualties.dead],
        ['Injured/Ill', reportData.casualties.injured_ill],
        ['Missing', reportData.casualties.missing],
      ];

      autoTable(doc, {
        startY: startY + 5,
        head: [['Casualty Type', 'Count']],
        body: casualtyData,
        theme: 'grid',
      });

      doc.save('Municipal_Population_Report.pdf');
      showToast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      showToast.error('Failed to export PDF');
    } finally {
      setExportLoading(false);
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

  useEffect(() => {
    fetchIncidents();
  }, [filters.barangay, filters.incident_type]);

  const renderReport = () => {
    if (!reportData) return null;

    return (
      <div className="row g-4">
        {/* Selected Incident Header */}
        {reportData.selected_incident && (
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h5 className="card-title mb-1">{reportData.selected_incident.title}</h5>
                <p className="card-text text-muted mb-0">
                  {reportData.selected_incident.incident_type} • {reportData.selected_incident.barangay} • {new Date(reportData.selected_incident.incident_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Population Affected */}
        <div className="col-12">
          <div className="card">
            <div className="card-header" style={{
              backgroundColor: "var(--primary-color)",
              background: "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)",
            }}>
              <h6 className="mb-0 text-white">Population Affected</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-primary">{reportData.population_affected.no_of_families}</h4>
                    <small className="text-muted">No. of Families</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-primary">{reportData.population_affected.no_of_persons}</h4>
                    <small className="text-muted">No. of Persons</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.population_affected.displaced_families}</h4>
                    <small className="text-muted">Displaced Families</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-warning">{reportData.population_affected.displaced_persons}</h4>
                    <small className="text-muted">Displaced Persons</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-info">{reportData.population_affected.families_requiring_assistance}</h4>
                    <small className="text-muted">Families Requiring Assistance</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 text-center">
                    <h4 className="text-success">{reportData.population_affected.families_assisted}</h4>
                    <small className="text-muted">Families Assisted</small>
                  </div>
                </div>
                <div className="col-12">
                  <div className="border rounded p-3 text-center bg-light">
                    <h4 className="text-success">{reportData.population_affected.percentage_families_assisted}%</h4>
                    <small className="text-muted">Percentage of Families Assisted</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gender & Civil Status */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">Gender Breakdown</h6>
            </div>
            <div className="card-body">
              {Object.entries(reportData.gender_breakdown).map(([gender, count]) => (
                <div key={gender} className="d-flex justify-content-between align-items-center border-bottom py-2">
                  <span className="text-capitalize">{gender}</span>
                  <strong className="text-primary">{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">Civil Status</h6>
            </div>
            <div className="card-body">
              {Object.entries(reportData.civil_status).map(([status, count]) => (
                <div key={status} className="d-flex justify-content-between align-items-center border-bottom py-2">
                  <span className="text-capitalize">{status.replace('_', ' ')}</span>
                  <strong className="text-primary">{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vulnerable Groups */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">Vulnerable Groups</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {Object.entries(reportData.vulnerable_groups).map(([group, count]) => (
                  <div key={group} className="col-md-4 col-sm-6">
                    <div className="border rounded p-3 text-center">
                      <h5 className="text-primary mb-1">{count}</h5>
                      <small className="text-muted text-capitalize">
                        {group.replace(/_/g, ' ').replace('4ps', '4Ps').replace('gbv', 'GBV')}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Age Categories */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">Age Categories</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {Object.entries(reportData.age_categories).map(([category, count]) => (
                  <div key={category} className="col-md-4 col-sm-6">
                    <div className="border rounded p-3 text-center">
                      <h5 className="text-primary mb-1">{count}</h5>
                      <small className="text-muted text-capitalize">
                        {category.replace(/_/g, ' ')}
                        {category === 'infant' && ' (0-6 mos)'}
                        {category === 'toddlers' && ' (7 mos-2 y/o)'}
                        {category === 'preschooler' && ' (3-5 y/o)'}
                        {category === 'school_age' && ' (6-12 y/o)'}
                        {category === 'teen_age' && ' (13-17 y/o)'}
                        {category === 'adult' && ' (18-59 y/o)'}
                        {category === 'elderly_age' && ' (60+)'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Casualties */}
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h6 className="mb-0">Casualties</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {Object.entries(reportData.casualties).map(([type, count]) => (
                  <div key={type} className="col-md-4">
                    <div className="border rounded p-3 text-center">
                      <h4 className={`text-${type === 'dead' ? 'danger' : type === 'injured_ill' ? 'warning' : 'info'}`}>
                        {count}
                      </h4>
                      <small className="text-muted text-capitalize">
                        {type.replace('_', '/')}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid px-1 fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 text-dark">Municipal Reports</h1>
          <p className="text-muted mb-0">Generate accurate population reports</p>
        </div>
      </div>

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
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Barangay</label>
              <select 
                className="form-select form-select-sm"
                value={filters.barangay}
                onChange={(e) => setFilters({...filters, barangay: e.target.value, incident_id: 'all'})}
              >
                <option value="all">All Barangays</option>
                {barangayOptions.map(barangay => (
                  <option key={barangay} value={barangay}>{barangay}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Incident Type</label>
              <select 
                className="form-select form-select-sm"
                value={filters.incident_type}
                onChange={(e) => setFilters({...filters, incident_type: e.target.value, incident_id: 'all'})}
              >
                <option value="all">All Types</option>
                {incidentTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Specific Incident</label>
              <select 
                className="form-select form-select-sm"
                value={filters.incident_id}
                onChange={(e) => setFilters({...filters, incident_id: e.target.value})}
                disabled={loadingIncidents}
              >
                <option value="all">All Incidents</option>
                {incidents.map(incident => (
                  <option key={incident.id} value={incident.id}>
                    {incident.title} - {new Date(incident.incident_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

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
          <div className="mt-3 d-flex gap-2">
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
                disabled={exportLoading}
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
              Population Report - {getDateRangeText()}
              {filters.barangay !== 'all' && ` - ${filters.barangay}`}
              {filters.incident_type !== 'all' && ` - ${filters.incident_type}`}
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

export default MunicipalReports;