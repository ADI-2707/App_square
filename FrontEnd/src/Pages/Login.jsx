import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg =
          data?.non_field_errors?.[0] ||
          data?.detail ||
          "Invalid email or password";
        toast.error(msg);
        return;
      }

      // ✅ Store tokens
      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful");
      navigate("/dashboard");
      
    } catch (error) {
      toast.error("Server not reachable. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-center text-3xl md:text-6xl font-bold mt-25 hero-header">
        Welcome Back!
      </h1>
      <div className="login-page -mt-2.5">
        <div className="login-card">
          <div className="icon-header">
            <FaUserShield size={32} color="var(--accent-color)" />
          </div>
          <h2>Login</h2>
          <p>Please enter your details to sign in.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="input-group" style={{ position: "relative" }}>
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                className="mt-1.5"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "38px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-color)",
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forget-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="button login-btn">
              Sign In
            </button>
          </form>

          <p className="signup-redirect">
            Don't have an account?{" "}
            <Link to="/signup">
              <span className="link-text">Sign up</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
