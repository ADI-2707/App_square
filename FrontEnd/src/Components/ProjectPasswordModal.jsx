import React, { useState } from "react";
import ModalPortal from "../Utility/ModalPortal";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "../Utility/api";

const ProjectPasswordModal = ({ isOpen, onClose, project, onVerified }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter the project password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/api/projects/${project.id}/verify-password/`,
        { password }
      );

      sessionStorage.setItem(
        `project_${project.id}_verified`,
        JSON.stringify({
          verified: true,
          timestamp: new Date().getTime(),
        })
      );
      setPassword("");
      onVerified();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content password-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="password-modal-header">
            <div className="password-modal-icon">
              <Lock size={24} />
            </div>
            <h2>Project Password Required</h2>
          </div>

          <div className="password-modal-body">
            <p className="password-modal-text">
              Enter the project password to access <strong>{project.name}</strong>
            </p>

            <form onSubmit={handleSubmit} className="password-modal-form">
              <div className="password-input-group">
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="password-input"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && <div className="password-error">{error}</div>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-verify-password"
              >
                {loading ? "Verifying..." : "Verify Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ProjectPasswordModal;