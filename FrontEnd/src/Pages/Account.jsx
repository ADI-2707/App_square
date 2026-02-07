import React, { useMemo, useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import api from "../Utility/api";
import { useAuth } from "../Utility/AuthContext";
import InvitationDetailModal from "../Components/InvitationDetailModal";
import ProjectPasswordModal from "../Components/ProjectPasswordModal";

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

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [acceptingInvitation, setAcceptingInvitation] = useState(null);

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
      const res = await api.get("/api/projects/invitations/pending/");
      setInvitations(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleAcceptWithPassword = async (password) => {
    if (!acceptingInvitation) return;

    setRespondingTo(acceptingInvitation.id);
    try {
      await api.post(
        `/api/projects/invitations/${acceptingInvitation.id}/accept/`,
        { password }
      );

      setInvitations((prev) =>
        prev.filter((inv) => inv.id !== acceptingInvitation.id)
      );

      setPasswordModalOpen(false);
      setShowDetailModal(false);
      setAcceptingInvitation(null);

      window.dispatchEvent(new CustomEvent("INVITES_UPDATED"));
    } catch (err) {
      throw err;
    } finally {
      setRespondingTo(null);
    }
  };

  const handleReject = async (invitationId) => {
    setRespondingTo(invitationId);
    try {
      await api.post(
        `/api/projects/invitations/${invitationId}/reject/`
      );

      setInvitations((prev) =>
        prev.filter((inv) => inv.id !== invitationId)
      );

      setShowDetailModal(false);
      window.dispatchEvent(new CustomEvent("INVITES_UPDATED"));
    } catch (err) {
      console.error("Failed to reject invitation:", err);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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

      <form className="account-card card-surface" onSubmit={handleSubmit}>
        <h2 className="account-title">Security</h2>

        <div className="password-grid">
          {[
            ["Current Password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent],
            ["New Password", newPassword, setNewPassword, showNew, setShowNew],
            ["Confirm Password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm],
          ].map(([label, value, setter, show, toggle], idx) => (
            <div className="account-field" key={idx}>
              <label>{label}</label>
              <div className="password-wrapper">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => toggle((v) => !v)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {invitations.length > 0 && (
        <div className="account-card card-surface invitations-card">
          <h2 className="account-title">Project Invitations</h2>

          <div className="invitations-list">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="invitation-item"
                onClick={() => {
                  setSelectedInvitation(inv);
                  setShowDetailModal(true);
                }}
              >
                <div>
                  <strong>{inv.project_name}</strong>
                  <div className="muted">{inv.public_code}</div>
                </div>

                <div className="invitation-actions">
                  <button
                    className="btn-accept"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAcceptingInvitation(inv);
                      setPasswordModalOpen(true);
                    }}
                  >
                    <Check size={18} />
                  </button>
                  <button
                    className="btn-reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(inv.id);
                    }}
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
        invitation={selectedInvitation}
        onClose={() => setShowDetailModal(false)}
        onAccept={() => {
          setAcceptingInvitation(selectedInvitation);
          setPasswordModalOpen(true);
        }}
        onReject={() => handleReject(selectedInvitation.id)}
        isLoading={respondingTo === selectedInvitation?.id}
      />

      <ProjectPasswordModal
        isOpen={passwordModalOpen}
        project={{ name: acceptingInvitation?.project_name }}
        onClose={() => {
          setPasswordModalOpen(false);
          setAcceptingInvitation(null);
        }}
        onVerified={handleAcceptWithPassword}
      />
    </div>
  );
};

export default Account;