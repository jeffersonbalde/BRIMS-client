// components/incident/PopulationDataModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert, showToast } from "../../services/notificationService";
import Portal from "../../components/Portal";

const PopulationDataModal = ({ incident, onClose, onSuccess }) => {
  const initialFormState = {
    // Displacement and Assistance
    displaced_families: 0,
    displaced_persons: 0,
    families_requiring_assistance: 0,
    families_assisted: 0,

    // Gender Distribution
    male_count: 0,
    female_count: 0,
    lgbtqia_count: 0,

    // Civil Status
    single_count: 0,
    married_count: 0,
    widowed_count: 0,
    separated_count: 0,
    live_in_count: 0,

    // Special Groups
    pwd_count: 0,
    pregnant_count: 0,
    elderly_count: 0,
    lactating_mother_count: 0,
    solo_parent_count: 0,
    indigenous_people_count: 0,
    lgbtqia_persons_count: 0,
    child_headed_household_count: 0,
    gbv_victims_count: 0,
    four_ps_beneficiaries_count: 0,
    single_headed_family_count: 0,

    // Age Distribution
    infant_count: 0,
    toddler_count: 0,
    preschooler_count: 0,
    school_age_count: 0,
    teen_age_count: 0,
    adult_count: 0,
    elderly_age_count: 0,

    // Religion
    christian_count: 0,
    subanen_ip_count: 0,
    moro_count: 0,
  };

  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [existingData, setExistingData] = useState(null);
  const formRef = useRef(null);
  const { token } = useAuth();

  // Replace the PopulationSkeleton component in PopulationDataModal.jsx
  const PopulationSkeleton = () => (
    <div
      className="modal-content border-0"
      style={{
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        maxHeight: "70vh",
        overflow: "hidden",
      }}
    >
      {/* Header Skeleton */}
      <div
        className="modal-header border-0 text-white"
        style={{
          background: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
        }}
      >
        <div className="w-100">
          <div
            className="skeleton-line mb-1"
            style={{ width: "50%", height: "20px" }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: "35%", height: "14px" }}
          ></div>
        </div>
      </div>

      <div
        className="modal-body bg-light p-3"
        style={{ maxHeight: "55vh", overflow: "hidden" }}
      >
        {/* Incident Summary Skeleton */}
        <div className="alert alert-info mb-3 p-2">
          <div
            className="skeleton-line"
            style={{ width: "70%", height: "16px" }}
          ></div>
          <div
            className="skeleton-line mt-1"
            style={{ width: "50%", height: "14px" }}
          ></div>
        </div>

        <div className="row g-2">
          {/* Displacement and Assistance Section Skeleton */}
          <div className="col-12">
            <div className="card border-0 bg-white mb-2">
              <div
                className="card-header border-bottom py-2 bg-white"
                style={{ borderColor: "rgba(23, 162, 184, 0.2)" }}
              >
                <div
                  className="skeleton-line"
                  style={{ width: "45%", height: "16px" }}
                ></div>
              </div>
              <div className="card-body p-2 bg-white">
                <div className="row g-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="col-12 col-md-3">
                      <div
                        className="skeleton-line mb-1"
                        style={{ width: "70%", height: "14px" }}
                      ></div>
                      <div
                        className="skeleton-box"
                        style={{ height: "38px" }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gender Distribution Skeleton */}
          <div className="col-12 col-md-6">
            <div className="card border-0 bg-white mb-2">
              <div
                className="card-header border-bottom py-2 bg-white"
                style={{ borderColor: "rgba(23, 162, 184, 0.2)" }}
              >
                <div
                  className="skeleton-line"
                  style={{ width: "40%", height: "16px" }}
                ></div>
              </div>
              <div className="card-body p-2 bg-white">
                <div className="row g-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="col-12">
                      <div
                        className="skeleton-line mb-1"
                        style={{ width: "30%", height: "14px" }}
                      ></div>
                      <div
                        className="skeleton-box"
                        style={{ height: "38px" }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Age Distribution Skeleton */}
          <div className="col-12 col-md-6">
            <div className="card border-0 bg-white mb-2">
              <div
                className="card-header border-bottom py-2 bg-white"
                style={{ borderColor: "rgba(23, 162, 184, 0.2)" }}
              >
                <div
                  className="skeleton-line"
                  style={{ width: "35%", height: "16px" }}
                ></div>
              </div>
              <div className="card-body p-2 bg-white">
                <div className="row g-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="col-12 col-md-6">
                      <div
                        className="skeleton-line mb-1"
                        style={{ width: "60%", height: "14px" }}
                      ></div>
                      <div
                        className="skeleton-box"
                        style={{ height: "38px" }}
                      ></div>
                    </div>
                  ))}
                  <div className="col-12">
                    <div
                      className="skeleton-line mb-1"
                      style={{ width: "50%", height: "14px" }}
                    ></div>
                    <div
                      className="skeleton-box"
                      style={{ height: "38px" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Groups Skeleton - Only show 2 rows to fit height */}
          <div className="col-12">
            <div className="card border-0 bg-white">
              <div
                className="card-header border-bottom py-2 bg-white"
                style={{ borderColor: "rgba(23, 162, 184, 0.2)" }}
              >
                <div
                  className="skeleton-line"
                  style={{ width: "30%", height: "16px" }}
                ></div>
              </div>
              <div className="card-body p-2 bg-white">
                <div className="row g-2">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="col-12 col-md-4">
                      <div
                        className="skeleton-line mb-1"
                        style={{ width: "50%", height: "14px" }}
                      ></div>
                      <div
                        className="skeleton-box"
                        style={{ height: "38px" }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="modal-footer border-top bg-white py-2">
        <div
          className="skeleton-box"
          style={{ width: "80px", height: "36px" }}
        ></div>
        <div
          className="skeleton-box"
          style={{ width: "150px", height: "36px" }}
        ></div>
      </div>
    </div>
  );

  // Load existing data when modal opens
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_LARAVEL_API}/incidents/${
            incident.id
          }/population-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setExistingData(data.data);
            // Pre-fill form with existing data
            setForm((prev) => ({
              ...prev,
              ...data.data,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading population data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [incident.id, token]);

  // Check if form has changes
  const checkFormChanges = (currentForm) => {
    return JSON.stringify(currentForm) !== JSON.stringify(initialFormState);
  };

  const validateForm = () => {
    const errors = {};
    // No strict validation needed since this is supplementary data
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      showAlert.error("Validation Error", "Please check the form for errors");
      return;
    }

    // Show confirmation dialog before submitting
    const confirmation = await showAlert.confirm(
      "Confirm Population Data",
      `Are you sure you want to ${
        existingData ? "update" : "save"
      } detailed population data for this incident?\n\nIncident: ${
        incident.title
      }\n\nThis detailed demographic data will be used for analytics and targeted assistance.`,
      `Yes, ${existingData ? "Update" : "Save"} Data`,
      "Review Data"
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Show processing SweetAlert
      showAlert.processing(
        `${existingData ? "Updating" : "Saving"} Population Data`,
        `Please wait while we ${
          existingData ? "update" : "save"
        } the detailed population data...`
      );

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/incidents/${
          incident.id
        }/population-data`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      // Close the processing alert
      showAlert.close();

      if (response.ok) {
        await showAlert.customSuccess(
          `Population Data ${existingData ? "Updated" : "Saved"}!`,
          `
            <div class="text-start">
              <p>Detailed population data has been ${
                existingData ? "updated" : "saved"
              } successfully for incident:</p>
              <p><strong>${incident.title}</strong></p>
              <p>This demographic information will help in targeted assistance and resource allocation.</p>
            </div>
          `,
          "Okay, Got It"
        );

        setHasUnsavedChanges(false);
        onSuccess();
      } else {
        showAlert.error(
          "Error",
          data.message ||
            `Failed to ${existingData ? "update" : "save"} population data`
        );
      }
    } catch (error) {
      // Close the processing alert on error
      showAlert.close();
      showAlert.error("Error", "Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: parseInt(value) || 0,
      };
      setHasUnsavedChanges(checkFormChanges(newForm));

      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }

      return newForm;
    });
  };

  const handleBackdropClick = async (e) => {
    if (e.target === e.currentTarget && !isSubmitting && !isLoading) {
      await handleCloseAttempt();
    }
  };

  const handleEscapeKey = async (e) => {
    if (e.key === "Escape" && !isSubmitting && !isLoading) {
      e.preventDefault();
      await handleCloseAttempt();
    }
  };

  const handleCloseAttempt = async () => {
    if (hasUnsavedChanges) {
      const result = await showAlert.confirm(
        "Unsaved Changes",
        "You have unsaved population data. Are you sure you want to close without saving?",
        "Yes, Close",
        "Continue Editing"
      );

      if (result.isConfirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleCloseButtonClick = async () => {
    await handleCloseAttempt();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    };
  }, [isSubmitting, hasUnsavedChanges, isLoading]);

  return (
    <Portal>
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl mx-3 mx-sm-auto">
          {isLoading ? (
            <PopulationSkeleton />
          ) : (
            <div
              className="modal-content border-0"
              style={{
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              {/* Header */}
              <div
                className="modal-header border-0 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-users me-2"></i>
                  {existingData ? "Edit" : "Add"} Population Data -{" "}
                  {incident.title}
                  {existingData && (
                    <span className="badge bg-light text-dark ms-2">
                      Editing Existing Data
                    </span>
                  )}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseButtonClick}
                  disabled={isSubmitting}
                  aria-label="Close"
                ></button>
              </div>

              <form ref={formRef} onSubmit={handleSubmit}>
                <div
                  className="modal-body bg-light"
                  style={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                  }}
                >
                  {/* Incident Summary Card */}
                  <div className="alert alert-info mb-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-info-circle me-2 fs-5"></i>
                      <div>
                        <strong>Incident Summary:</strong>{" "}
                        {incident.affected_families} families affected,
                        {incident.affected_individuals} individuals affected.
                        {incident.casualties && (
                          <span className="ms-2">
                            Casualties: {incident.casualties.dead || 0} dead,
                            {incident.casualties.injured || 0} injured,
                            {incident.casualties.missing || 0} missing.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    {/* Displacement and Assistance Section */}
                    <div className="col-12">
                      <div className="card border-0 bg-white">
                        <div
                          className="card-header border-bottom py-3 bg-white"
                          style={{
                            borderColor: "rgba(23, 162, 184, 0.2)",
                          }}
                        >
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-house-damage me-2 text-info"></i>
                            Displacement and Assistance
                          </h6>
                        </div>
                        <div className="card-body p-3 bg-white">
                          <div className="row g-3">
                            <div className="col-12 col-md-3">
                              <label className="form-label fw-semibold text-dark">
                                Displaced Families
                              </label>
                              <input
                                type="number"
                                name="displaced_families"
                                value={form.displaced_families}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-3">
                              <label className="form-label fw-semibold text-dark">
                                Displaced Persons
                              </label>
                              <input
                                type="number"
                                name="displaced_persons"
                                value={form.displaced_persons}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-3">
                              <label className="form-label fw-semibold text-dark">
                                Families Requiring Assistance
                              </label>
                              <input
                                type="number"
                                name="families_requiring_assistance"
                                value={form.families_requiring_assistance}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-3">
                              <label className="form-label fw-semibold text-dark">
                                Families Assisted
                              </label>
                              <input
                                type="number"
                                name="families_assisted"
                                value={form.families_assisted}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gender Distribution */}
                    <div className="col-12 col-md-6">
                      <div className="card border-0 bg-white">
                        <div
                          className="card-header border-bottom py-3 bg-white"
                          style={{
                            borderColor: "rgba(23, 162, 184, 0.2)",
                          }}
                        >
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-venus-mars me-2 text-primary"></i>
                            Gender Distribution
                          </h6>
                        </div>
                        <div className="card-body p-3 bg-white">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Male
                              </label>
                              <input
                                type="number"
                                name="male_count"
                                value={form.male_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Female
                              </label>
                              <input
                                type="number"
                                name="female_count"
                                value={form.female_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                LGBTQIA+
                              </label>
                              <input
                                type="number"
                                name="lgbtqia_count"
                                value={form.lgbtqia_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Age Distribution */}
                    <div className="col-12 col-md-6">
                      <div className="card border-0 bg-white">
                        <div
                          className="card-header border-bottom py-3 bg-white"
                          style={{
                            borderColor: "rgba(23, 162, 184, 0.2)",
                          }}
                        >
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-child me-2 text-success"></i>
                            Age Distribution
                          </h6>
                        </div>
                        <div className="card-body p-3 bg-white">
                          <div className="row g-3">
                            <div className="col-12 col-md-6">
                              <label className="form-label fw-semibold text-dark">
                                Infant (0-6 mos)
                              </label>
                              <input
                                type="number"
                                name="infant_count"
                                value={form.infant_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label fw-semibold text-dark">
                                Toddlers (7 mos-2 y/o)
                              </label>
                              <input
                                type="number"
                                name="toddler_count"
                                value={form.toddler_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label fw-semibold text-dark">
                                Preschooler (3-5 y/o)
                              </label>
                              <input
                                type="number"
                                name="preschooler_count"
                                value={form.preschooler_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label fw-semibold text-dark">
                                School Age (6-12 y/o)
                              </label>
                              <input
                                type="number"
                                name="school_age_count"
                                value={form.school_age_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label fw-semibold text-dark">
                                Teen Age (13-17 y/o)
                              </label>
                              <input
                                type="number"
                                name="teen_age_count"
                                value={form.teen_age_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-6">
                              <label className="form-label fw-semibold text-dark">
                                Adult (18-59 y/o)
                              </label>
                              <input
                                type="number"
                                name="adult_count"
                                value={form.adult_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold text-dark">
                                Elderly (60 and above)
                              </label>
                              <input
                                type="number"
                                name="elderly_age_count"
                                value={form.elderly_age_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Groups */}
                    <div className="col-12">
                      <div className="card border-0 bg-white">
                        <div
                          className="card-header border-bottom py-3 bg-white"
                          style={{
                            borderColor: "rgba(23, 162, 184, 0.2)",
                          }}
                        >
                          <h6 className="mb-0 fw-semibold text-dark">
                            <i className="fas fa-heart me-2 text-danger"></i>
                            Special Groups
                          </h6>
                        </div>
                        <div className="card-body p-3 bg-white">
                          <div className="row g-3">
                            <div className="col-12 col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                PWD
                              </label>
                              <input
                                type="number"
                                name="pwd_count"
                                value={form.pwd_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                Pregnant
                              </label>
                              <input
                                type="number"
                                name="pregnant_count"
                                value={form.pregnant_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                Elderly
                              </label>
                              <input
                                type="number"
                                name="elderly_count"
                                value={form.elderly_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                Indigenous People
                              </label>
                              <input
                                type="number"
                                name="indigenous_people_count"
                                value={form.indigenous_people_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                4Ps Beneficiaries
                              </label>
                              <input
                                type="number"
                                name="four_ps_beneficiaries_count"
                                value={form.four_ps_beneficiaries_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                GBV Victims
                              </label>
                              <input
                                type="number"
                                name="gbv_victims_count"
                                value={form.gbv_victims_count}
                                onChange={handleInputChange}
                                className="form-control bg-white"
                                min="0"
                                placeholder="0"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-top bg-white">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCloseButtonClick}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn fw-semibold position-relative"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting
                        ? "var(--bs-secondary)"
                        : "#17a2b8",
                      borderColor: isSubmitting
                        ? "var(--bs-secondary)"
                        : "#17a2b8",
                      color: "white",
                      transition: "all 0.3s ease",
                      minWidth: "140px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.target.style.backgroundColor = "#138496";
                        e.target.style.borderColor = "#138496";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 8px rgba(19, 132, 150, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.target.style.backgroundColor = "#17a2b8";
                        e.target.style.borderColor = "#17a2b8";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {existingData ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {existingData ? "Update" : "Save"} Population Data
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default PopulationDataModal;
