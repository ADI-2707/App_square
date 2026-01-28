import React, { useMemo, useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import api from "../Utility/api";
import { useAuth } from "../Utility/AuthContext";
import InvitationDetailModal from "../Components/InvitationDetailModal";

const Account = () => {
  const { logout } = useAuth();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const response = await api.get("/api/projects/invitations/pending/");
      setInvitations(response.data.results || []);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleInvitationResponse = async (memberId, action) => {
    setRespondingTo(memberId);
    try {
      await api.post(
        `/api/projects/members/${memberId}/respond/`,
        { action }
      );
      setInvitations(invitations.filter((inv) => inv.id !== memberId));
      setShowDetailModal(false);
    } catch (err) {
      console.error(`Failed to ${action} invitation:`, err);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await api.post("/api/auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      alert("Password updated successfully. Please log in again.");
      logout();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

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

      <form
        className="account-card card-surface"
        onSubmit={handleSubmit}
      >
        <h2 className="account-title">Security</h2>

        <div className="password-grid">
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

        <p className="password-hint">
          Password must be at least 8 characters long.
        </p>

        {error && (
          <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="primary-btn"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {invitations.length > 0 && (
        <div className="account-card card-surface invitations-card">
          <h2 className="account-title">Project Invitations</h2>
          <p className="invitations-subtitle">
            You have {invitations.length} pending invitation{invitations.length !== 1 ? "s" : ""}
          </p>

          <div className="invitations-list">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="invitation-item"
                onClick={() => {
                  setSelectedInvitation(invitation);
                  setShowDetailModal(true);
                }}
                role="button"
                tabIndex={0}
              >
                <div className="invitation-info">
                  <div className="invitation-project-name">
                    {invitation.project_name}
                  </div>
                  <div className="invitation-details">
                    <span className="invitation-code">{invitation.public_code}</span>
                    <span className="invitation-date">
                      {new Date(invitation.invited_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="invitation-actions">
                  <button
                    className="btn-accept"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInvitationResponse(invitation.id, "accept");
                    }}
                    disabled={respondingTo === invitation.id}
                    title="Accept invitation"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    className="btn-reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInvitationResponse(invitation.id, "reject");
                    }}
                    disabled={respondingTo === invitation.id}
                    title="Reject invitation"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <InvitationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        invitation={selectedInvitation}
        onAccept={() =>
          handleInvitationResponse(selectedInvitation.id, "accept")
        }
        onReject={() =>
          handleInvitationResponse(selectedInvitation.id, "reject")
        }
        isLoading={respondingTo === selectedInvitation?.id}
      />
    </div>
  );
};

export default Account;