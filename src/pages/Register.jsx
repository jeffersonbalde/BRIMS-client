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
import { showAlert, showToast } from "../services/notificationService";
import Logo from "../assets/images/logo.png";
import TextLogo from "../assets/images/text-logo-no-bg.png";
import RegisterBackground from "../assets/images/register-pic.jpg";
import DefaultAvatar from "../assets/images/default-avatar.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import the auth context

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
  const { login } = useAuth(); // Get the login function from auth context

  useEffect(() => {
    const img = new Image();
    img.src = RegisterBackground;
    img.onload = () => setBackgroundLoaded(true);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // In Register.jsx, replace the theme object:
  const theme = {
    primary: "#2d5a27", // Your primary color
    textPrimary: "#1a2a1a", // Your text primary
    textSecondary: "#4a5c4a", // Your text secondary
    inputBg: "#f8faf8", // Your input background
    inputText: "#1a2a1a", // Your input text
    inputBorder: "#c8d0c8", // Your input border
  };

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
        // This ensures the auth state is updated throughout the app
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

  // Format contact number for display (XXX-XXX-XXXX)
  const formatContact = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(
      6,
      11
    )}`;
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row position-relative">
      {/* Left Panel - Fixed on large screens */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5 position-fixed start-0 top-0 h-100">
        {/* Background Image with Blur Effect - SEPARATE DIV */}
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

        {/* Gradient Overlay - SEPARATE DIV */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(rgba(45, 90, 39, 0.85), rgba(45, 90, 39, 0.85))",
          }}
        />

        {/* Content - ALWAYS CLEAR */}
        <div className="position-relative z-2 d-flex flex-column align-items-center justify-content-center w-100 h-100 px-4">
          {/* Logo Section - Same as Login.jsx */}
          <div className="text-center mb-4">
            <div
              className="d-flex align-items-center justify-content-center mx-auto"
              style={{
                width: "fit-content",
                gap: "0.3rem",
              }}
            >
              {/* Left: Logo Image */}
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

              {/* Right: Text Logo + Description */}
              <div
                className="d-flex flex-column justify-content-center align-items-start"
                style={{
                  width: "150px",
                }}
              >
                <img
                  src={TextLogo}
                  alt="System Text Logo"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    marginBottom: "0.2rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Title - Same styling as Login */}
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
        {/* Floating Elements - Only in right panel */}
        <div className="floating-elements">
          <div className="floating-icon floating-1">🏠</div>
          <div className="floating-icon floating-2">📊</div>
          <div className="floating-icon floating-3">🚨</div>
          <div className="floating-icon floating-4">👥</div>
          <div className="floating-icon floating-5">🌐</div>
          <div className="floating-icon floating-6">🛡️</div>
          <div className="floating-icon floating-7">📱</div>
          <div className="floating-icon floating-8">🔒</div>
        </div>

        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-lg-4">
          <div
            className={`bg-white rounded-4 shadow-lg p-4 p-sm-5 w-100 form-container ${
              isMounted ? "fade-in" : ""
            }`}
            style={{
              maxWidth: "480px",
              border: "1px solid var(--border-color)",
              position: "relative",
              zIndex: 2,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <h3
              className="fw-bold text-center mb-2"
              style={{ color: theme.primary }} // Changed from theme.textPrimary to theme.primary
            >
              Barangay Account Registration
            </h3>
            <p
              className="text-center mb-4"
              style={{ color: theme.textSecondary, fontSize: "14px" }}
            >
              Please fill out the form below to register your barangay.
            </p>

            {/* Approval Notice */}
            <div className="alert alert-info text-center small mb-4">
              <strong>Note:</strong> Your account will require admin approval.
              You can login immediately but will have limited access until
              approved.
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
                    border: `3px solid ${theme.primary} !important`,
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
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaUser className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.name ? "is-invalid" : ""
                    } ${
                      getFieldStatus("name") === "success" ? "is-valid" : ""
                    }`}
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.name
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    disabled={isSubmitting}
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
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaBuilding className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="barangayName"
                    placeholder="Barangay Name"
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
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.barangayName
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    disabled={isSubmitting}
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
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaUser className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="position"
                    placeholder="Position / Role"
                    value={form.position}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.position ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.position
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    disabled={isSubmitting}
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
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaEnvelope className="text-muted" size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.email ? "is-invalid" : ""
                    } ${
                      getFieldStatus("email") === "success" ? "is-valid" : ""
                    }`}
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.email
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    disabled={isSubmitting}
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
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaLock className="text-muted" size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.password ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.password
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    minLength={8}
                    disabled={isSubmitting}
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
              </div>

              {/* Confirm Password */}
              <div className="mb-3 position-relative">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaLock className="text-muted" size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.confirmPassword ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.confirmPassword
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    minLength={8}
                    disabled={isSubmitting}
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
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaPhone className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="contact"
                    placeholder="Contact Number (11 digits)"
                    value={formatContact(form.contact)}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.contact ? "is-invalid" : ""
                    } ${
                      getFieldStatus("contact") === "success" ? "is-valid" : ""
                    }`}
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.contact
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    maxLength={13} // 11 digits + 2 dashes
                    disabled={isSubmitting}
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
                  Format: 09XX-XXX-XXXX (11 digits total)
                </div>
              </div>

              {/* Municipality */}
              <div className="mb-4 position-relative">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <FaMapMarkerAlt className="text-muted" size={16} />
                  </span>
                  <input
                    type="text"
                    name="municipality"
                    placeholder="Municipality"
                    value={form.municipality}
                    onChange={handleInputChange}
                    className={`form-control border-start-0 ps-2 fw-semibold ${
                      fieldErrors.municipality ? "is-invalid" : ""
                    }`}
                    style={{
                      backgroundColor: theme.inputBg,
                      color: theme.inputText,
                      borderColor: fieldErrors.municipality
                        ? "#dc3545"
                        : theme.inputBorder,
                    }}
                    required
                    disabled={isSubmitting}
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
                className="btn-login w-100 py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center"
                disabled={
                  isSubmitting ||
                  Object.keys(fieldErrors).some((key) => fieldErrors[key])
                }
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner me-2" />
                    Registering...
                  </>
                ) : (
                  "Sign up"
                )}
              </button>

              {/* Login Link */}
              <p
                className="text-center mt-3 small fw-semibold"
                style={{ color: theme.primary }} // Changed from theme.textPrimary to theme.primary
              >
                Already have an account?{" "}
                <Link
                  to="/"
                  className="fw-bold"
                  style={{ color: theme.primary }} // Changed from theme.textPrimary to theme.primary
                >
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
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

        /* Floating Elements - Only in right panel */
        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-icon {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.12;
          animation: float 8s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        /* Desktop positions */
        .floating-1 {
          top: 15%;
          left: 8%;
          animation-delay: 0s;
        }
        .floating-2 {
          top: 20%;
          right: 10%;
          animation-delay: 1s;
        }
        .floating-3 {
          bottom: 30%;
          left: 10%;
          animation-delay: 2s;
        }
        .floating-4 {
          bottom: 15%;
          right: 8%;
          animation-delay: 3s;
        }
        .floating-5 {
          top: 40%;
          left: 15%;
          animation-delay: 1.5s;
        }
        .floating-6 {
          top: 35%;
          right: 15%;
          animation-delay: 2.5s;
        }
        .floating-7 {
          bottom: 45%;
          right: 18%;
          animation-delay: 0.5s;
        }
        .floating-8 {
          top: 65%;
          left: 12%;
          animation-delay: 3.5s;
        }

        /* Button styles */
        .btn-login {
          background: linear-gradient(135deg, #2d5a27, #3a6b32);
          color: white;
          border: none;
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45, 90, 39, 0.3);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-login::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .btn-login:hover::before {
          left: 100%;
        }

        /* Spinner Animation */
        .spinner {
          animation: spin 1s linear infinite;
        }

        /* Input group custom styles */
        .input-group-text {
          border-color: var(--input-border) !important;
          background-color: var(--input-bg) !important;
        }

        .input-group .form-control:focus {
          box-shadow: none;
          border-color: var(--input-border);
        }

        .input-group .form-control.is-invalid {
          border-color: #dc3545;
        }

        .input-group .form-control.is-valid {
          border-color: #198754;
        }

        /* Animations */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-12px) rotate(4deg) scale(1.05);
          }
          66% {
            transform: translateY(8px) rotate(-2deg) scale(0.98);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 991px) {
          .floating-elements {
            display: none;
          }

          .form-container {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        }

        @media (min-width: 992px) {
          .floating-icon {
            font-size: 1.8rem;
            opacity: 0.1;
          }
        }

        @media (max-width: 768px) {
          .bg-white {
            backdrop-filter: none;
            background-color: white !important;
          }

          .form-control {
            font-size: 16px;
          }

          .input-group-text {
            padding: 0.5rem 0.75rem;
          }
        }

        @media (max-width: 576px) {
          .form-container {
            padding: 1.5rem !important;
          }

          .input-group-text {
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
