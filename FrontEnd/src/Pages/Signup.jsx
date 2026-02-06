import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PASSWORD_RULES = {
  length: {
    test: (v) => v.length >= 8,
    label: "At least 8 characters",
  },
  lowercase: {
    test: (v) => /[a-z]/.test(v),
    label: "1 lowercase letter",
  },
  uppercase: {
    test: (v) => /[A-Z]/.test(v),
    label: "1 uppercase letter",
  },
  number: {
    test: (v) => /\d/.test(v),
    label: "1 number",
  },
  special: {
    test: (v) => /[@#_]/.test(v),
    label: "1 special character (@ # _)",
  },
};

const getPasswordStrength = (password) => {
  let score = 0;

  Object.values(PASSWORD_RULES).forEach((rule) => {
    if (rule.test(password)) score++;
  });

  return score;
};

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#_])[A-Za-z\d@#_]{8,}$/;

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 350);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "confirmPassword") {
      setPasswordTouched(true);
    }
  };

  const passwordsMismatch =
    passwordTouched &&
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.confirmPassword) {
      triggerShake();
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      triggerShake();
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (getPasswordStrength(formData.password) < 5) {
      triggerShake();
      toast.error("Please satisfy all password requirements.");
      return;
    }

    if (passwordsMismatch) {
      triggerShake();
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const firstError =
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.confirmPassword?.[0] ||
          data?.non_field_errors?.[0] ||
          "Registration failed";

        toast.error(firstError);
        return;
      }

      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Server not reachable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-center text-3xl md:text-6xl font-bold mt-25 hero-header mb-15">
        Start managing your recipes here!
      </h1>
      <div className="auth-page">
        <div className="login-page">
          <div className={`mt-20 login-card ${shake ? "error" : ""}`}>
            <div className="icon-header">
              <FaUserPlus size={32} color="var(--accent-color)" />
            </div>
            <h2>Create Account</h2>

            <form onSubmit={handleSignup}>
              <div className="input-group">
                <label htmlFor="fullname">Full Name</label>
                <input
                  type="text"
                  id="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="input-group password-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    role="button"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="password-checklist">
                {Object.entries(PASSWORD_RULES).map(([key, rule]) => {
                  const passed = rule.test(formData.password);

                  return (
                    <div
                      key={key}
                      className={`password-rule ${passed ? "valid" : "invalid"}`}
                    >
                      {passed ? "✔" : "✖"} {rule.label}
                    </div>
                  );
                })}
              </div>
              <div className="password-strength">
                <div
                  className={`strength-bar strength-${getPasswordStrength(
                    formData.password,
                  )}`}
                />
                <span className="strength-label">
                  {
                    [
                      "Very Weak",
                      "Weak",
                      "Okay",
                      "Good",
                      "Strong",
                      "Very Strong",
                    ][getPasswordStrength(formData.password)]
                  }
                </span>
              </div>

              <div className="input-group password-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={passwordsMismatch ? "input-error" : ""}
                    placeholder="••••••••"
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    role="button"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              {passwordsMismatch && (
                <small className="password-mismatch">
                  Passwords do not match
                </small>
              )}

              <button
                type="submit"
                className="button login-btn mt-7"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="signup-redirect">
              Already have an account?{" "}
              <span className="link-text" onClick={() => navigate("/login")}>
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
