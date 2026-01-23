import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../Utility/api";
import { useAuth } from "../Utility/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const res = await api.post("/api/auth/login/", formData);
      const data = res.data;

      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      login(data.user, data.tokens.access, data.tokens.refresh);
      toast.success("Login successful!");
      navigate("/home", { replace: true });
      
    } catch (error) {
      const errorData = error.response?.data;
      let msg = "Unable to login. Please try again!";

      if (errorData) {
        msg = errorData.email?.[0] || 
              errorData.password?.[0] || 
              errorData.error || 
              errorData.detail || 
              (Array.isArray(errorData) ? errorData[0] : Object.values(errorData)[0]);
      }

      toast.error(typeof msg === 'string' ? msg : "Invalid email or password!");
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

            <button type="submit" className="button login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
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