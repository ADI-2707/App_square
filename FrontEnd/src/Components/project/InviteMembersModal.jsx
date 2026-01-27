import React, { useState, useEffect, useRef } from "react";
import { Users, Search, Loader, Check, X } from "lucide-react";
import ModalPortal from "../../Utility/ModalPortal";
import api from "../../Utility/api";

const InviteMembersModal = ({ project, onClose, onInvited }) => {
  const [email, setEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const debounceTimer = useRef(null);

  // Debounced search function
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Reset results if email is empty
    if (email.trim().length === 0) {
      setSearchResults([]);
      setSelectedUser(null);
      return;
    }

    // Only search if at least 3 characters
    if (email.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    // Set new debounce timer (300ms)
    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await api.get(
          `/api/projects/${project.id}/search-users/`,
          {
            params: { email: email.trim() }
          }
        );
        setSearchResults(response.data.results || []);
        setError("");
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search users");
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [email, project.id]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setEmail(user.email);
    setSearchResults([]);
  };

  const handleInvite = async () => {
    if (!selectedUser) {
      setError("Please select a user to invite");
      return;
    }

    setInviting(true);
    setError("");

    try {
      const response = await api.post(
        `/api/projects/${project.id}/invite/`,
        {
          user_id: selectedUser.id
        }
      );

      setSuccess(`Invitation sent to ${selectedUser.email}`);
      setTimeout(() => {
        onInvited();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Invite error:", err);
      const errorMsg =
        err.response?.data?.detail || "Failed to send invitation";
      setError(errorMsg);
    } finally {
      setInviting(false);
    }
  };

  const handleClear = () => {
    setEmail("");
    setSelectedUser(null);
    setSearchResults([]);
    setError("");
    setSuccess("");
  };

  const getDisplayName = (user) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return user.email;
  };

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content invite-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header invite-header">
            <Users size={24} color="#3b82f6" />
            <h2>Invite Members</h2>
          </div>

          <div className="modal-body">
            <p className="invite-description">
              Invite registered users to collaborate on this project
            </p>

            <div className="invite-search-container">
              <div className="invite-input-wrapper">
                <Search size={18} className="invite-search-icon" />
                <input
                  type="email"
                  className="invite-input"
                  placeholder="Search by email (minimum 3 characters)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={inviting}
                  autoFocus
                />
                {email && (
                  <button
                    className="invite-clear-btn"
                    onClick={handleClear}
                    disabled={inviting}
                    title="Clear"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {loading && (
                <div className="invite-loading">
                  <Loader size={16} className="spinner" />
                  Searching...
                </div>
              )}

              {searchResults.length > 0 && !selectedUser && (
                <div className="invite-results">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      className="invite-result-item"
                      onClick={() => handleUserSelect(user)}
                      disabled={inviting}
                    >
                      <div className="invite-result-info">
                        <div className="invite-result-name">
                          {getDisplayName(user)}
                        </div>
                        <div className="invite-result-email">{user.email}</div>
                      </div>
                      <div className="invite-result-arrow">→</div>
                    </button>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="invite-selected">
                  <div className="invite-selected-item">
                    <div className="invite-selected-info">
                      <div className="invite-selected-name">
                        {getDisplayName(selectedUser)}
                      </div>
                      <div className="invite-selected-email">
                        {selectedUser.email}
                      </div>
                    </div>
                    <Check size={20} color="#10b981" />
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message invite-error">
                  <span>❌ {error}</span>
                </div>
              )}

              {success && (
                <div className="success-message invite-success">
                  <span>✅ {success}</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer invite-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={inviting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleInvite}
              disabled={!selectedUser || inviting}
            >
              {inviting ? (
                <>
                  <Loader size={16} className="spinner" />
                  Inviting...
                </>
              ) : (
                "Send Invitation"
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default InviteMembersModal;
