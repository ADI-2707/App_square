import React, { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "../Utility/api";
import { logout } from "../Utility/auth";

const Account = () => {
  /* ----------------------------------
     UI state for password visibility
  ---------------------------------- */
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ----------------------------------
     Form field state
  ---------------------------------- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ----------------------------------
     UX state
  ---------------------------------- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ----------------------------------
     Load user from localStorage safely
  ---------------------------------- */
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  /* ----------------------------------
     Form submit handler
     - Triggered by button click OR Enter key
  ---------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent full page reload
    setError("");

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Call backend API (JWT protected)
      await api.post("/api/auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      // Security best practice
      alert("Password updated successfully. Please log in again.");
      logout();
      window.location.href = "/login";
    } catch (err) {
      // Show backend message if available
      setError(err.response?.data?.detail || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     Fallback if user is missing
  ---------------------------------- */
  if (!user) {
    return (
      <div className="account-page">
        <div className="account-card card-surface">
          <p>Unable to load account details.</p>
        </div>
      </div>
    );
  }

  /* ----------------------------------
     Render
  ---------------------------------- */
  return (
    <div className="account-page">
      {/* ===== Profile Intro Card ===== */}
      <div className="account-intro-wrapper">
        <div className="account-intro-card">
          <div className="intro-avatar">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="intro-name">{user.full_name}</div>
          <div className="intro-email">{user.email}</div>
        </div>
      </div>

      {/* ===== Security Form ===== */}
      <form
        className="account-card card-surface"
        onSubmit={handleSubmit} // 🔑 enables Enter key submit
      >
        <h2 className="account-title">Security</h2>

        <div className="password-grid">
          {/* ----- Current Password ----- */}
          <div className="account-field">
            <label>Current Password</label>
            <div className="password-wrapper">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label="Toggle current password visibility"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ----- New Password ----- */}
          <div className="account-field">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNew((v) => !v)}
                aria-label="Toggle new password visibility"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ----- Confirm Password ----- */}
          <div className="account-field">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ----- Helper + Error ----- */}
        <p className="password-hint">
          Password must be at least 8 characters long.
        </p>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px" }}>
            {error}
          </p>
        )}

        {/* ----- Submit Button ----- */}
        <button
          type="submit" // 🔑 required for Enter key
          className="primary-btn"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default Account;