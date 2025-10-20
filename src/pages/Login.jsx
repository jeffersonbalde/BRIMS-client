import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { showAlert, showToast } from "../services/notificationService";
import LoginBackground from "../assets/images/login-background.png";
import Logo from "../assets/images/logo.png";
import TextLogo from "../assets/images/text-logo.png";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  // Theme variables for easy maintenance
  // In Login.jsx, replace the theme object:
  const theme = {
    primary: "#2d5a27", // Your primary color
    primaryDark: "#1f3d1a", // Your primary dark
    primaryLight: "#336C35", // Your primary light
    textPrimary: "#1a2a1a", // Your text primary
    textSecondary: "#4a5c4a", // Your text secondary
    backgroundLight: "#f8faf8", // Your background light
    backgroundWhite: "#ffffff", // Your background white
    borderColor: "#e0e6e0", // Your border color
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.email || !form.password) {
      showAlert.error("Validation Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Show loading alert
      const loadingAlert = showAlert.loading("Signing you in...");

      const result = await login(form.email, form.password);

      // Close loading alert
      showAlert.close();

      if (result.success) {
        // Show success toast
        showToast.success(`Welcome back, ${result.user.name}!`);

        // Small delay before redirect to show the toast
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Show error alert for login failures
        showAlert.error(
          "Login Failed",
          result.error || "Please check your credentials and try again."
        );
      }
    } catch (error) {
      showAlert.close();
      showAlert.error(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection and try again."
      );
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const result = await showAlert.info(
      "Forgot Password?",
      "Please contact your barangay administrator to reset your password. They can assist you with account recovery."
    );
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${LoginBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: theme.backgroundLight,
      }}
    >
      <div
        className="bg-white rounded-4 shadow-lg p-4 p-sm-5 w-100 mx-4 mx-sm-0"
        style={{
          maxWidth: "420px",
          border: `1px solid ${theme.borderColor}`,
          animation: "fadeIn 0.6s ease-in-out",
        }}
      >
        {/* Logo Section */}
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
              <p
                className="fw-bolder text-start"
                style={{
                  fontSize: "9px",
                  color: theme.primary, // Changed from theme.textPrimary to theme.primary
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                BARANGAY REAL-TIME INCIDENT MONITORING SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <h5
          className="text-center fw-bolder fs-4"
          style={{
            marginTop: "2rem",
            marginBottom: "2rem",
            color: theme.primary, // Changed from theme.textPrimary to theme.primary
          }}
        >
          Log in to your account
        </h5>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <label
            htmlFor="email"
            className="mb-1 fw-semibold"
            style={{ fontSize: ".9rem", color: theme.textSecondary }}
          >
            Email
          </label>
          <div className="mb-3 position-relative">
            <FaEnvelope
              className="position-absolute top-50 translate-middle-y text-muted ms-3"
              size={16}
            />
            <input
              type="email"
              name="email"
              className="form-control ps-5 fw-semibold"
              placeholder="Email"
              value={form.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--input-text)",
                border: "1px solid var(--input-border)",
              }}
              id="email"
            />
          </div>

          {/* Password */}
          <label
            htmlFor="password"
            className="mb-1 fw-semibold"
            style={{ fontSize: ".9rem", color: theme.textSecondary }}
          >
            Password
          </label>
          <div className="mb-3 position-relative">
            <FaLock
              className="position-absolute top-50 translate-middle-y text-muted ms-3"
              size={16}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control ps-5 pe-5 fw-semibold"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--input-text)",
                border: "1px solid var(--input-border)",
              }}
              id="password"
            />
            <span
              onClick={() => !isSubmitting && setShowPassword(!showPassword)}
              className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
              style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Forgot Password */}
          <div
            className="text-end mb-3 fw-semibold"
            style={{ marginTop: "-10px" }}
          >
            <a
              href="#"
              className="text-decoration-none small fw-semibold"
              style={{ color: theme.primary }} // Changed from theme.textPrimary to theme.primary
              onClick={handleForgotPassword}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-login w-100 py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spinner me-2" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Register Link */}
          <p
            className="text-center mt-3 small fw-semibold"
            style={{ color: theme.primary }} // Changed from hardcoded color to theme.primary
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="fw-bold"
              style={{ color: theme.primary }} // Changed from hardcoded color to theme.primary
            >
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
