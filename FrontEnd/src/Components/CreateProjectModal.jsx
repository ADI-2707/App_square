import React, { useState, useEffect } from "react";
import { X, Trash2, Copy } from "lucide-react";

const MAX_MEMBERS = 3;

const CreateProjectModal = ({ onClose, onCreate }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState("");
  const [members, setMembers] = useState([{ email: "", role: "ADMIN" }]);

  const [projectId, setProjectId] = useState("");
  const [accessKey, setAccessKey] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- INIT -------------------- */

  useEffect(() => {
    const id = "APSQ-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    setProjectId(id);
  }, []);

  /* -------------------- MEMBER HANDLERS -------------------- */

  const addMemberRow = () => {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((prev) => [...prev, { email: "", role: "USER" }]);
  };

  const updateMemberEmail = (index, value) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, email: value } : m))
    );
  };

  const toggleAdmin = (index) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, role: m.role === "ADMIN" ? "USER" : "ADMIN" } : m
      )
    );
  };

  const removeMember = (index) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  /* -------------------- CREATE -------------------- */

  const handleCreate = async () => {
    if (submitting) return;

    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    if (accessKey.length < 6) {
      setError("Project password must be at least 6 characters");
      return;
    }

    const validMembers = members.filter((m) => m.email.trim() !== "");
    const adminCount = validMembers.filter((m) => m.role.toUpperCase() === "ADMIN").length;

    if (adminCount < 1) {
      setError("At least one member must be marked as Admin");
      return;
    }

    if (validMembers.length > MAX_MEMBERS) {
      setError("You can add at most 3 members");
      return;
    }

    const payload = {
      name: name.trim(),
      project_id: projectId,
      access_key: accessKey,
      members: validMembers,
    };

    try {
      setSubmitting(true);
      await onCreate(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Project creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} disabled={submitting}>
          <X size={18} />
        </button>

        <h2>Create Project</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Project Name */}
        <label>Project Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          disabled={submitting}
        />

        {/* Project ID */}
        <label>Project ID</label>
        <div className="copy-field">
          <input value={projectId} disabled />
          <button
            onClick={() => navigator.clipboard.writeText(projectId)}
            title="Copy Project ID"
          >
            <Copy size={16} />
          </button>
        </div>

        {/* Project Password */}
        <label>Project Password</label>
        <input
          type="password"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          placeholder="Set project access password"
          disabled={submitting}
        />
        <p className="password-hint">
          This password will be required to join the project
        </p>

        {/* Root Admin */}
        <label>Root Admin</label>
        <input value={user?.full_name || ""} disabled />

        {/* Members */}
        {members.map((member, index) => (
          <div className="member-block" key={index}>
            <div className="member-header">
              <label>Add Member</label>

              <div className="member-actions">
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={member.role === "ADMIN"}
                    onChange={() => toggleAdmin(index)}
                    disabled={submitting}
                  />
                  <span>Admin</span>
                </label>

                <button
                  className="delete-member-btn"
                  onClick={() => removeMember(index)}
                  disabled={members.length === 1 || submitting}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <input
              type="email"
              className="member-email"
              value={member.email}
              onChange={(e) => updateMemberEmail(index, e.target.value)}
              placeholder="user@example.com"
              disabled={submitting}
            />
          </div>
        ))}

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="primary-btn"
            onClick={addMemberRow}
            disabled={members.length >= MAX_MEMBERS || submitting}
          >
            Add Member
          </button>

          <button
            className="primary-btn"
            onClick={handleCreate}
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
