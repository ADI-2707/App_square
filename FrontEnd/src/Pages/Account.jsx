import React, { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Account = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-card card-surface">
          <p>Unable to load account details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-intro-wrapper">
        <div className="account-intro-card">
          <div className="intro-avatar">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>

          <div className="intro-name">{user.full_name}</div>
          <div className="intro-email">{user.email}</div>
        </div>
      </div>

      <div className="account-card card-surface">
        <h2 className="account-title">Security</h2>

        <div className="password-grid">
          <div className="account-field">
            <label>Current Password</label>

            <div className="password-wrapper">
              <input type={showCurrent ? "text" : "password"} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="account-field">
            <label>New Password</label>
            <div className="password-wrapper">
              <input type={showNew ? "text" : "password"} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="account-field">
            <label>Confirm Password</label>

            <div className="password-wrapper">
              <input type={showConfirm ? "text" : "password"} />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <p className="password-hint">
          Password must be at least 8 characters long.
        </p>

        <button className="primary-btn">Update Password</button>
      </div>
    </div>
  );
};

export default Account;
