import React, { useEffect, useState } from "react";
import { X, Users, Loader } from "lucide-react";
import ModalPortal from "../../Utility/ModalPortal";
import api from "../../Utility/api";

const ViewMembersModal = ({ project, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const isRootAdmin = project.role === "root_admin";

  useEffect(() => {
    fetchMembers();
  }, [offset]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/projects/${project.id}/members/`,
        {
          params: { limit, offset }
        }
      );
      setMembers(res.data.results || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        "Unable to load project members"
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      return name
        .split(" ")
        .map(p => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return email?.[0]?.toUpperCase() || "?";
  };

  const roleClass = (role) => {
    if (role === "root_admin") return "role-badge-root";
    if (role === "admin") return "role-badge-admin";
    return "role-badge-user";
  };

  return (
    <ModalPortal>
      <div className="modal-backdrop" onClick={onClose}>
        <div
          className="modal-card large fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>

          <h2 className="modal-title">
            <Users size={18} style={{ marginRight: 8 }} />
            Project Members
          </h2>

          {!isRootAdmin && (
            <p className="modal-muted">
              You have read-only access to project members
            </p>
          )}

          {loading && (
            <div className="loading-text">
              <Loader size={16} className="spinner" /> Loading members…
            </div>
          )}

          {error && (
            <div className="modal-error">
              ❌ {error}
            </div>
          )}

          {!loading && !error && members.length === 0 && (
            <div className="empty-state">
              No members found
            </div>
          )}

          {!loading && members.length > 0 && (
            <div className="members-list">
              {members.map((m) => (
                <div key={`${m.user_id}-${m.role}`} className="member-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      {getInitials(m.name, m.email)}
                    </div>

                    <div className="member-details">
                      <div className="member-name">
                        {m.name || m.email}
                      </div>
                      <div className="member-email">
                        {m.email}
                      </div>
                    </div>
                  </div>

                  <div className="member-meta">
                    <span className={roleClass(m.role)}>
                      {m.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pagination-controls">
            <button
              className="btn-pagination"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              ← Previous
            </button>

            <span className="pagination-info">
              Showing {offset + 1} – {offset + members.length}
            </span>

            <button
              className="btn-pagination"
              disabled={members.length < limit}
              onClick={() => setOffset(offset + limit)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ViewMembersModal;