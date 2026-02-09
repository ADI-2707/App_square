import React, { useState, useEffect } from "react";
import ModalPortal from "../Utility/ModalPortal";
import {
  Trash2,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../Utility/api";

const SecuritySettingsModal = ({ isOpen, onClose, project }) => {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    if (isOpen && project?.id) {
      fetchMembers(0);
    }
  }, [isOpen, project?.id]);

  const fetchMembers = async (page = 0) => {
    try {
      setLoadingMembers(true);
      const offset = page * pageSize;
      const response = await api.get(
        `/api/projects/${project.id}/members/?limit=${pageSize}&offset=${offset}`,
      );
      setMembers(response.data.results || []);
      setTotalMembers(response.data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setMessage("Failed to load members");
      setMessageType("error");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleRevokeAccess = async (memberId, memberEmail) => {
    if (!window.confirm(`Revoke access for ${memberEmail}?`)) return;

    setRevoking(memberId);
    try {
      await api.delete(
        `/api/projects/${project.id}/members/${memberId}/revoke/`,
      );
      setMembers(members.filter((m) => m.id !== memberId));
      setMessage(`Access revoked for ${memberEmail}`);
      setMessageType("success");
      setTotalMembers(totalMembers - 1);
    } catch (err) {
      console.error("Failed to revoke access:", err);
      setMessage("Failed to revoke access");
      setMessageType("error");
    } finally {
      setRevoking(null);
    }
  };

  const handleRoleToggle = async (memberId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    if (!window.confirm(`Change role to ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      await api.patch(`/api/projects/${project.id}/members/${memberId}/role/`, {
        role: newRole,
      });

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );

      setMessage("Role updated successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to update role");
      setMessageType("error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setMessage("Please enter a password");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      setMessageType("error");
      return;
    }

    setLoadingPassword(true);
    try {
      await api.post(`/api/projects/${project.id}/change-pin/`, {
        new_password: newPassword,
      });
      setNewPassword("");
      setMessage("Project password updated successfully");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to change password:", err);
      setMessage(err.response?.data?.detail || "Failed to change password");
      setMessageType("error");
    } finally {
      setLoadingPassword(false);
    }
  };

  const totalPages = Math.ceil(totalMembers / pageSize);
  const canPrevious = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  if (!isOpen || !project) return null;

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content security-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="security-header">
            <h2>Security Settings</h2>
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {message && (
            <div className={`security-message ${messageType}`}>{message}</div>
          )}

          <div className="security-content">
            <div className="security-section">
              <h3 className="section-title">Project Members</h3>
              <p className="section-subtitle">
                {totalMembers} member{totalMembers !== 1 ? "s" : ""} total
              </p>

              {loadingMembers ? (
                <div className="loading-text">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="empty-state">No members</div>
              ) : (
                <>
                  <div className="members-list">
                    {members.map((member) => (
                      <div
                        key={`${member.id}-${member.user_id}`}
                        className="member-item"
                      >
                        <div className="member-info">
                          <div className="member-avatar">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="member-details">
                            <div className="member-name">{member.name}</div>
                            <div className="member-email">{member.email}</div>
                          </div>
                        </div>

                        <div className="member-meta">
                          <span className={`role-badge-${member.role}`}>
                            {member.role?.charAt(0).toUpperCase() +
                              member.role?.slice(1).toLowerCase()}
                          </span>
                          {member.role !== "root_admin" && (
                            <button
                              className="btn-revoke"
                              onClick={() =>
                                handleRevokeAccess(member.id, member.email)
                              }
                              disabled={revoking === member.id}
                              title="Revoke access"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        className="btn-pagination"
                        onClick={() => fetchMembers(currentPage - 1)}
                        disabled={!canPrevious}
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {currentPage + 1} of {totalPages}
                      </span>
                      <button
                        className="btn-pagination"
                        onClick={() => fetchMembers(currentPage + 1)}
                        disabled={!canNext}
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="security-section">
              <h3 className="section-title">
                <Lock size={18} />
                Change Project Password
              </h3>
              <p className="section-subtitle">
                Update the password created during project setup
              </p>

              <form onSubmit={handleChangePassword} className="pin-form">
                <div className="pin-input-wrapper">
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pin-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="pin-hint">
                    Password must be at least 6 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="btn-change-pin"
                >
                  {loadingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default SecuritySettingsModal;
