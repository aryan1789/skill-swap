import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaBriefcase, FaEye, FaEyeSlash } from "react-icons/fa";
import "../Login.css"; // Use the same CSS as login page

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (pw: string) => pw.length >= 8;

// Comprehensive validation function
const validateForm = () => {
  // Check if all fields are filled
  if (!name.trim()) {
    setError("Please enter your full name.");
    return false;
  }

  if (!email.trim()) {
    setError("Please enter your email address.");
    return false;
  }

  if (!occupation.trim()) {
    setError("Please enter your occupation.");
    return false;
  }

  if (!password.trim()) {
    setError("Please enter a password.");
    return false;
  }

  if (!confirmPassword.trim()) {
    setError("Please confirm your password.");
    return false;
  }

  // Check email format
  if (!isValidEmail(email)) {
    setError("Please enter a valid email address.");
    return false;
  }

  // Check password strength
  if (!isStrongPassword(password)) {
    setError("Password must be at least 8 characters long.");
    return false;
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    setError("Passwords do not match. Please try again.");
    return false;
  }

  return true;
};

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");
  setError("");

  // Validate form before submitting
  if (!validateForm()) {
    return;
  }

  setLoading(true);

    try {
      const response = await fetch("http://localhost:5209/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, occupation }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Handle different types of server errors
        let errorMessage = "Registration failed. Please try again.";
        
        if (result.error) {
          // Check if it's a specific error we can handle
          const errorString = result.error.toLowerCase();
          if (errorString.includes("email") && errorString.includes("exist")) {
            errorMessage = "An account with this email already exists. Please use a different email or try logging in.";
          } else if (errorString.includes("invalid email")) {
            errorMessage = "Please enter a valid email address.";
          } else if (errorString.includes("password")) {
            errorMessage = "Password does not meet requirements. Please ensure it's at least 8 characters long.";
          } else {
            errorMessage = result.error;
          }
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordToggle = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Real-time validation for better UX
  const getPasswordError = () => {
    if (password && !isStrongPassword(password)) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const getConfirmPasswordError = () => {
    if (confirmPassword && password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const getEmailError = () => {
    if (email && !isValidEmail(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const canSubmit = 
    name.trim() !== "" && 
    email.trim() !== "" && 
    occupation.trim() !== "" && 
    password.trim() !== "" && 
    confirmPassword.trim() !== "" && 
    isValidEmail(email) && 
    isStrongPassword(password) && 
    password === confirmPassword;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Join SkillSwap</h1>
          <p>Create an account to start swapping skills with others</p>
        </div>

        <form onSubmit={handleSignUp} className="login-form">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#FEF2F2" />
                <path d="M8 4V8M8 12H8.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {message && (
            <div className="success-message" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#BBF7D0" />
                <path d="M5 8L7 10L11 6" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={error && !name.trim() ? "error" : ""}
                required
              />
              <FaUser className="input-icon" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error && (!email.trim() || getEmailError()) ? "error" : ""}
                required
              />
              <FaEnvelope className="input-icon" size={20} />
            </div>
            {email && getEmailError() && (
              <div style={{ color: "#DC2626", fontSize: "0.875rem", marginTop: "4px" }}>
                {getEmailError()}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="occupation">Occupation</label>
            <div className="input-wrapper">
              <input
                id="occupation"
                type="text"
                placeholder="Enter your occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className={error && !occupation.trim() ? "error" : ""}
                required
              />
              <FaBriefcase className="input-icon" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error && (!password.trim() || getPasswordError()) ? "error" : ""}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={handlePasswordToggle}
              >
                {showPassword ? (
                  <FaEye size={20} />
                ) : (
                  <FaEyeSlash size={20} />
                )}
              </button>
            </div>
            {password && getPasswordError() && (
              <div style={{ color: "#DC2626", fontSize: "0.875rem", marginTop: "4px" }}>
                {getPasswordError()}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={error && (!confirmPassword.trim() || getConfirmPasswordError()) ? "error" : ""}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={handleConfirmPasswordToggle}
              >
                {showConfirmPassword ? (
                  <FaEye size={20} />
                ) : (
                  <FaEyeSlash size={20} />
                )}
              </button>
            </div>
            {confirmPassword && getConfirmPasswordError() && (
              <div style={{ color: "#DC2626", fontSize: "0.875rem", marginTop: "4px" }}>
                {getConfirmPasswordError()}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <a href="/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
