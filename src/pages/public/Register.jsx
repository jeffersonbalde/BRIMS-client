import { useState, useRef, useEffect } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaCamera,
  FaTimes,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { showAlert, showToast } from "../../services/notificationService";
import Logo from "../../assets/images/logo.png";
import RegisterBackground from "../../assets/images/register-pic.jpg";
import DefaultAvatar from "../../assets/images/default-avatar.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    barangayName: "",
    position: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    municipality: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [checkingDuplicates, setCheckingDuplicates] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const img = new Image();
    img.src = RegisterBackground;
    img.onload = () => setBackgroundLoaded(true);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for contact number - limit to 11 digits
    if (name === "contact") {
      // Remove all non-digit characters and limit to 11 digits
      const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: digitsOnly }));

      // Clear error for this field when user starts typing
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      }

      // Check for duplicates
      if (digitsOnly.length >= 10) {
        checkDuplicate(name, digitsOnly);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field when user starts typing
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      }

      // Check for duplicates in real-time for specific fields
      if (["email", "barangayName", "name"].includes(name)) {
        checkDuplicate(name, value);
      }
    }
  };

  const checkDuplicate = async (field, value) => {
    if (!value || value.length < 2) return;

    setCheckingDuplicates((prev) => ({ ...prev, [field]: true }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/check-duplicates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            field: field,
            value: value,
            municipality: form.municipality,
            barangayName: form.barangayName,
            name: form.name,
            position: form.position,
          }),
        }
      );

      const data = await response.json();

      if (data.exists) {
        setFieldErrors((prev) => ({ ...prev, [field]: data.message }));
      } else {
        setFieldErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } catch (error) {
      console.error("Duplicate check error:", error);
    } finally {
      setCheckingDuplicates((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showAlert.error(
          "Invalid File",
          "Please select an image file (JPEG, PNG, etc.)"
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert.error("File Too Large", "Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      showToast.success("Avatar uploaded successfully");
    }
  };

  const removeAvatar = async () => {
    const result = await showAlert.confirm(
      "Remove Avatar",
      "Are you sure you want to remove the uploaded avatar?",
      "Yes, Remove",
      "Keep It"
    );

    if (result.isConfirmed) {
      setAvatarPreview(null);
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      showToast.info("Avatar removed");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Please enter your full name";
    }

    if (!form.barangayName.trim()) {
      errors.barangayName = "Please enter your barangay name";
    }

    if (!form.position.trim()) {
      errors.position = "Please enter your position/role";
    }

    if (!form.email.trim()) {
      errors.email = "Please enter your email address";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!form.contact.trim()) {
      errors.contact = "Please enter your contact number";
    } else {
      const contactRegex = /^[0-9]{11}$/;
      if (!contactRegex.test(form.contact)) {
        errors.contact = "Please enter a valid 11-digit contact number";
      }
    }

    if (!form.municipality.trim()) {
      errors.municipality = "Please enter your municipality";
    }

    if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    // Check for duplicate errors
    Object.keys(fieldErrors).forEach((key) => {
      if (fieldErrors[key]) {
        errors[key] = fieldErrors[key];
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Show first error
      const firstError = Object.values(errors)[0];
      showAlert.error("Validation Error", firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const loadingAlert = showAlert.loading("Creating your account...");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("barangayName", form.barangayName);
      formData.append("position", form.position);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("password_confirmation", form.confirmPassword);
      formData.append("contact", form.contact);
      formData.append("municipality", form.municipality);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_LARAVEL_API}/register`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      showAlert.close();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem("access_token", data.access_token);

        // Update auth context by manually logging in the user
        const loginResult = await login(form.email, form.password);

        if (loginResult.success) {
          // Show success message with approval notice
          await showAlert.success(
            "Registration Successful!",
            data.message ||
              "Your account has been created successfully. You can now access the dashboard but will have limited access until admin approval."
          );

          // Redirect to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // If auto-login fails, show message and redirect to login
          await showAlert.success(
            "Registration Successful!",
            "Your account has been created successfully. Please login to access your dashboard."
          );
          navigate("/", { replace: true });
        }
      } else {
        // Handle specific error messages from backend
        if (data.errors) {
          // Set field-specific errors
          setFieldErrors(data.errors);
          // Show first error
          const firstError = Object.values(data.errors).flat()[0];
          showAlert.error("Registration Failed", firstError);
        } else {
          showAlert.error(
            "Registration Failed",
            data.message ||
              "There was an error creating your account. Please try again."
          );
        }
      }
    } catch (error) {
      showAlert.close();
      showAlert.error(
        "Network Error",
        "Unable to connect to the server. Please check your internet connection and try again."
      );
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldStatus = (fieldName) => {
    if (checkingDuplicates[fieldName]) {
      return "checking";
    }
    if (fieldErrors[fieldName]) {
      return "error";
    }
    if (
      form[fieldName] &&
      !fieldErrors[fieldName] &&
      (fieldName !== "contact" || form.contact.length === 11)
    ) {
      return "success";
    }
    return "default";
  };

  const renderFieldIcon = (fieldName) => {
    const status = getFieldStatus(fieldName);

    switch (status) {
      case "checking":
        return <FaSpinner className="spinner" size={14} />;
      case "error":
        return <FaExclamationTriangle className="text-danger" size={14} />;
      case "success":
        return <FaCheck className="text-success" size={14} />;
      default:
        return null;
    }
  };

// Format contact number for display (XXXX-XXX-XXXX) - Philippine format
const formatContact = (value) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 4) return numbers;
  if (numbers.length <= 7)
    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`;
};

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row position-relative">
      {/* Left Panel - Fixed on large screens */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5 position-fixed start-0 top-0 h-100">
        {/* Background Image with Blur Effect */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${RegisterBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: backgroundLoaded ? "blur(0px)" : "blur(10px)",
            transition: "filter 0.5s ease-in-out",
          }}
        />

        {/* Gradient Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(rgba(45, 90, 39, 0.85), rgba(45, 90, 39, 0.85))",
          }}
        />

        {/* Content - ALWAYS CLEAR */}
        <div className="position-relative z-2 d-flex flex-column align-items-center justify-content-center w-100 h-100 px-4">
          {/* Logo Section */}
          <div className="text-center mb-4">
            <div
              className="d-flex align-items-center justify-content-center mx-auto"
              style={{
                width: "fit-content",
                gap: "0.3rem",
              }}
            >
              {/* Logo Image */}
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: "85px",
                }}
              >
                <img
                  src={Logo}
                  alt="Barangay Logo"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h4
            className="fw-bold text-center mb-3"
            style={{
              color: "white",
              fontSize: "1.5rem",
            }}
          >
            Barangay Real-Time Incident Monitoring System
          </h4>

          {/* Description */}
          <p
            className="text-center mx-auto"
            style={{
              fontSize: "15px",
              maxWidth: "360px",
              color: "rgba(255,255,255,0.9)",
              lineHeight: "1.5",
            }}
          >
            Register your barangay to start monitoring incidents and population
            in real-time. Empower your community with BRIMS.
          </p>
        </div>
      </div>

      {/* Right Panel - Scrollable with Floating Animations */}
      <div className="col-12 col-lg-6 ms-lg-auto position-relative">
        {/* Incident Monitoring Theme Background */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: "#f8f9fa",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)",
          }}
        ></div>

{/* Professional Government Monitoring Theme - Enhanced Visibility */}
<div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden monitoring-elements">
  {/* Geometric Monitoring Shapes */}
  <div className="monitoring-shape shape-polygon-1"></div>
  <div className="monitoring-shape shape-polygon-2"></div>
  <div className="monitoring-shape shape-polygon-3"></div>
  
  {/* Network Connection Lines */}
  <div className="network-line line-1"></div>
  <div className="network-line line-2"></div>
  <div className="network-line line-3"></div>
  
  {/* Data Flow Dots */}
  <div className="data-dot dot-1"></div>
  <div className="data-dot dot-2"></div>
  <div className="data-dot dot-3"></div>
  <div className="data-dot dot-4"></div>
  
  {/* Monitoring Grid */}
  <div className="monitoring-grid"></div>
</div>

                {/* Subtle grid pattern overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `
              linear-gradient(rgba(51, 107, 49, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(51, 107, 49, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            pointerEvents: 'none'
          }}
        ></div>

        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-lg-4">
          <div
            className={`bg-white rounded-4 shadow-lg p-4 p-sm-5 w-100 form-container ${
              isMounted ? "fade-in" : ""
            }`}
            style={{
              maxWidth: "480px",
              border: `1px solid var(--border-color)`,
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Mobile Logo - Only show on small screens */}
            <div className="d-lg-none text-center mb-4">
              <div className="d-flex align-items-center justify-content-center">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    filter: backgroundLoaded ? "blur(0px)" : "blur(8px)",
                    opacity: backgroundLoaded ? 1 : 0,
                    transition: "all 0.6s ease",
                  }}
                >
                  <img
                    src={Logo}
                    alt="Barangay Logo"
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-start mb-4">
              <h1
                className="fw-bolder mb-2"
                style={{ color: "var(--primary-color)", fontSize: "1.5rem" }}
              >
                Create Your Account
              </h1>
              <p
                className="fw-semibold mb-0"
                style={{
                  lineHeight: "1.4",
                  fontSize: "0.9rem",
                  color: "var(--primary-color)",
                }}
              >
                Register your barangay to access the incident monitoring system.
                Your account will be activated after verification.
              </p>
            </div>

            {/* Approval Notice */}
            <div className="alert alert-info text-center small mb-4">
              <strong>Note:</strong> Your account requires verification. You'll
              receive an email once activated.
            </div>

            {/* Avatar Upload Section */}
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <div
                  className="rounded-circle overflow-hidden border position-relative"
                  style={{
                    width: "100px",
                    height: "100px",
                    cursor: "pointer",
                    border: `3px solid var(--primary-color) !important`,
                  }}
                  onClick={handleAvatarClick}
                >
                  <img
                    src={avatarPreview || DefaultAvatar}
                    alt="Avatar Preview"
                    className="w-100 h-100 object-fit-cover"
                    style={{
                      filter: avatarPreview ? "none" : "brightness(0.9)",
                    }}
                  />
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                  >
                    <FaCamera className="text-white" size={20} />
                  </div>
                </div>

                {avatarPreview && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute rounded-circle p-1"
                    style={{
                      top: "-5px",
                      right: "-5px",
                      width: "24px",
                      height: "24px",
                      border: "2px solid white",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAvatar();
                    }}
                  >
                    <FaTimes size={10} />
                  </button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="d-none"
                />
              </div>
              <p className="small text-muted mt-2 mb-0">
                Click on the avatar to upload a photo (optional)
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="name"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Full Name *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaUser className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.name ? "is-invalid" : ""
                    } ${
                      getFieldStatus("name") === "success" ? "is-valid" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--input-text)",
                      borderColor: fieldErrors.name
                        ? "#dc3545"
                        : "var(--input-border)",
                    }}
                    required
                    disabled={isSubmitting}
                    id="name"
                  />
                  <span className="input-group-text bg-transparent border-start-0">
                    {renderFieldIcon("name")}
                  </span>
                </div>
                {fieldErrors.name && (
                  <div className="invalid-feedback d-block small mt-1">
                    {fieldErrors.name}
                  </div>
                )}
              </div>

              {/* Barangay Name */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="barangayName"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Barangay Name *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaBuilding className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="barangayName"
                    placeholder="Enter your barangay name"
                    value={form.barangayName}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.barangayName ? "is-invalid" : ""
                    } ${
                      getFieldStatus("barangayName") === "success"
                        ? "is-valid"
                        : ""
                    }`}
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--input-text)",
                      borderColor: fieldErrors.barangayName
                        ? "#dc3545"
                        : "var(--input-border)",
                    }}
                    required
                    disabled={isSubmitting}
                    id="barangayName"
                  />
                  <span className="input-group-text bg-transparent border-start-0">
                    {renderFieldIcon("barangayName")}
                  </span>
                </div>
                {fieldErrors.barangayName && (
                  <div className="invalid-feedback d-block small mt-1">
                    {fieldErrors.barangayName}
                  </div>
                )}
              </div>

              {/* Position */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="position"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Position / Role *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaUser className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="position"
                    placeholder="Enter your position/role"
                    value={form.position}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.position ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--input-text)",
                      borderColor: fieldErrors.position
                        ? "#dc3545"
                        : "var(--input-border)",
                    }}
                    required
                    disabled={isSubmitting}
                    id="position"
                  />
                </div>
                {fieldErrors.position && (
                  <div className="invalid-feedback d-block small mt-1">
                    {fieldErrors.position}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="email"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Email Address *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaEnvelope className="text-muted" size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.email ? "is-invalid" : ""
                    } ${
                      getFieldStatus("email") === "success" ? "is-valid" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--input-text)",
                      borderColor: fieldErrors.email
                        ? "#dc3545"
                        : "var(--input-border)",
                    }}
                    required
                    disabled={isSubmitting}
                    id="email"
                  />
                  <span className="input-group-text bg-transparent border-start-0">
                    {renderFieldIcon("email")}
                  </span>
                </div>
                {fieldErrors.email && (
                  <div className="invalid-feedback d-block small mt-1">
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="password"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Password *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaLock className="text-muted" size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.password ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--input-text)",
                      borderColor: fieldErrors.password
                        ? "#dc3545"
                        : "var(--input-border)",
                    }}
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    id="password"
                  />
                  <span className="input-group-text bg-transparent border-start-0">
                    <button
                      type="button"
                      className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                      onClick={() =>
                        !isSubmitting && setShowPassword(!showPassword)
                      }
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  </span>
                </div>
                {fieldErrors.password && (
                  <div className="invalid-feedback d-block small mt-1">
                    {fieldErrors.password}
                  </div>
                )}
                <div className="form-text small mt-1">
                  Password must be at least 8 characters long
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3 position-relative">
                <label
                  htmlFor="confirmPassword"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Confirm Password *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaLock className="text-muted" size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.confirmPassword ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--input-text)",
                      borderColor: fieldErrors.confirmPassword
                        ? "#dc3545"
                        : "var(--input-border)",
                    }}
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    id="confirmPassword"
                  />
                  <span className="input-group-text bg-transparent border-start-0">
                    <button
                      type="button"
                      className="btn btn-sm p-0 border-0 bg-transparent text-muted"
                      onClick={() =>
                        !isSubmitting &&
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  </span>
                </div>
                {fieldErrors.confirmPassword && (
                  <div className="invalid-feedback d-block small mt-1">
                    {fieldErrors.confirmPassword}
                  </div>
                )}
              </div>

{/* Contact */}
<div className="mb-3 position-relative">
  <label
    htmlFor="contact"
    className="form-label fw-semibold mb-2"
    style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
  >
    Contact Number *
  </label>
  <div className="input-group">
    <span className="input-group-text bg-transparent border-end-0">
      <FaPhone className="text-muted" size={16} />
    </span>
    <input
      type="text"
      name="contact"
      placeholder="09XX-XXX-XXXX (11 digits)"
      value={formatContact(form.contact)}
      onChange={handleInputChange}
      className={`form-control border-start-0 ps-2 fw-semibold ${
        fieldErrors.contact ? "is-invalid" : ""
      } ${
        getFieldStatus("contact") === "success" ? "is-valid" : ""
      }`}
      style={{
        backgroundColor: "var(--input-bg)",
        color: "var(--input-text)",
        borderColor: fieldErrors.contact
          ? "#dc3545"
          : "var(--input-border)",
      }}
      required
      maxLength={13} // 11 digits + 2 dashes (XXXX-XXX-XXXX)
      disabled={isSubmitting}
      id="contact"
    />
    <span className="input-group-text bg-transparent border-start-0">
      {renderFieldIcon("contact")}
    </span>
  </div>
  {fieldErrors.contact && (
    <div className="invalid-feedback d-block small mt-1">
      {fieldErrors.contact}
    </div>
  )}
  <div className="form-text small mt-1">
    Format: 09XX-XXX-XXXX (11 digits)
  </div>
</div>

              {/* Municipality */}
              <div className="mb-4 position-relative">
                <label
                  htmlFor="municipality"
                  className="form-label fw-semibold mb-2"
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Municipality *
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaMapMarkerAlt className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="municipality"
                    placeholder="Enter your municipality"
                    value={form.municipality}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.municipality ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--input-text)",
                      borderColor: fieldErrors.municipality
                        ? "#dc3545"
                        : "var(--input-border)",
                    }}
                    required
                    disabled={isSubmitting}
                    id="municipality"
                  />
                </div>
                {fieldErrors.municipality && (
                  <div className="invalid-feedback d-block small mt-1">
                    {fieldErrors.municipality}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn w-100 fw-semibold d-flex justify-content-center align-items-center position-relative"
                disabled={isSubmitting}
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--btn-primary-text)",
                  height: "43px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "1rem",
                  transition: "all 0.3s ease-in-out",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = "var(--primary-dark)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = "var(--primary-color)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
                  }
                }}
                onMouseDown={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner me-2" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Login Link */}
              <p
                className="text-center mt-4 pt-3 mb-0 small fw-semibold border-top"
                style={{
                  color: "var(--primary-color)",
                  paddingTop: "1rem",
                  borderColor: "var(--border-color) !important",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/"
                  className="fw-bold text-decoration-underline"
                  style={{ color: "var(--primary-color)" }}
                >
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
               /* Professional Government Monitoring Theme - Enhanced Visibility */
.monitoring-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* Enhanced Geometric Monitoring Shapes */
.monitoring-shape {
  position: absolute;
  border: 3px solid; /* Increased border width */
  border-radius: 6px;
  animation: floatShape 20s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Added shadow for depth */
}

.shape-polygon-1 {
  top: 15%;
  left: 8%;
  width: 50px; /* Increased size */
  height: 50px;
  background: linear-gradient(135deg, rgba(51, 107, 49, 0.15) 0%, rgba(51, 107, 49, 0.05) 100%);
  border-color: rgba(51, 107, 49, 0.3); /* Darker border */
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  animation-delay: 0s;
}

.shape-polygon-2 {
  top: 70%;
  right: 12%;
  width: 40px; /* Increased size */
  height: 40px;
  background: linear-gradient(135deg, rgba(199, 74, 104, 0.12) 0%, rgba(199, 74, 104, 0.04) 100%);
  border-color: rgba(199, 74, 104, 0.25); /* Darker border */
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  animation-delay: 5s;
}

.shape-polygon-3 {
  bottom: 25%;
  left: 15%;
  width: 45px; /* Increased size */
  height: 45px;
  background: linear-gradient(135deg, rgba(45, 90, 39, 0.14) 0%, rgba(45, 90, 39, 0.04) 100%);
  border-color: rgba(45, 90, 39, 0.28); /* Darker border */
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  animation-delay: 10s;
}

/* Enhanced Network Connection Lines */
.network-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(51, 107, 49, 0.2), transparent);
  height: 2px; /* Increased thickness */
  animation: pulseLine 8s ease-in-out infinite;
  box-shadow: 0 1px 3px rgba(51, 107, 49, 0.2); /* Added glow effect */
}

.line-1 {
  top: 30%;
  left: 5%;
  width: 140px; /* Increased length */
  transform: rotate(25deg);
  animation-delay: 0s;
}

.line-2 {
  top: 60%;
  right: 8%;
  width: 120px; /* Increased length */
  transform: rotate(-15deg);
  animation-delay: 2s;
}

.line-3 {
  bottom: 35%;
  left: 20%;
  width: 100px; /* Increased length */
  transform: rotate(45deg);
  animation-delay: 4s;
}

/* Enhanced Data Flow Dots */
.data-dot {
  position: absolute;
  background: rgba(51, 107, 49, 0.2); /* Darker dots */
  border-radius: 50%;
  animation: flowDot 12s linear infinite;
  box-shadow: 0 0 6px rgba(51, 107, 49, 0.3); /* Added glow */
}

.dot-1 {
  top: 25%;
  right: 20%;
  width: 8px; /* Larger dots */
  height: 8px;
  animation-delay: 0s;
}

.dot-2 {
  top: 45%;
  left: 25%;
  width: 6px; /* Larger dots */
  height: 6px;
  animation-delay: 3s;
}

.dot-3 {
  bottom: 30%;
  right: 30%;
  width: 7px; /* Larger dots */
  height: 7px;
  animation-delay: 6s;
}

.dot-4 {
  bottom: 45%;
  left: 10%;
  width: 5px; /* Larger dots */
  height: 5px;
  animation-delay: 9s;
}

/* Enhanced Monitoring Grid */
.monitoring-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(51, 107, 49, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(51, 107, 49, 0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridPulse 20s ease-in-out infinite;
}

/* Enhanced Animations */
@keyframes floatShape {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.5; /* Increased base opacity */
  }
  25% {
    transform: translateY(-15px) rotate(5deg);
    opacity: 0.8; /* Increased peak opacity */
  }
  50% {
    transform: translateY(-10px) rotate(-3deg);
    opacity: 0.7;
  }
  75% {
    transform: translateY(-20px) rotate(2deg);
    opacity: 0.9; /* Increased peak opacity */
  }
}

@keyframes pulseLine {
  0%, 100% {
    opacity: 0.2; /* Increased base opacity */
    transform: scaleX(0.8);
  }
  50% {
    opacity: 0.5; /* Increased peak opacity */
    transform: scaleX(1);
  }
}

@keyframes flowDot {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0.3; /* Higher starting opacity */
  }
  10% {
    opacity: 0.8; /* Higher peak opacity */
  }
  50% {
    transform: translateY(-40px) translateX(20px);
    opacity: 1; /* Maximum opacity */
  }
  90% {
    opacity: 0.5; /* Higher ending opacity */
  }
  100% {
    transform: translateY(-80px) translateX(40px);
    opacity: 0.2; /* Higher ending opacity */
  }
}

@keyframes gridPulse {
  0%, 100% {
    opacity: 0.4; /* Increased base opacity */
  }
  50% {
    opacity: 0.8; /* Increased peak opacity */
  }
}

/* Mobile Responsive */
@media (max-width: 991px) {
  .monitoring-elements {
    display: none;
  }
}

/* Form Container Animation */
.form-container {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-in-out;
}

.form-container.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(45, 90, 39, 0.25);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  boxShadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
}

/* Input field hover effects */
.form-control:hover:not(:focus):not(:disabled) {
  border-color: rgba(45, 90, 39, 0.5);
}

/* Link hover effects */
a.text-decoration-underline:hover {
  opacity: 0.8;
  cursor: pointer;
}

/* Error state styling */
.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .form-control {
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .form-container {
    padding: 1.5rem !important;
  }
}
      `}</style>
    </div>
  );
}