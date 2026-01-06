import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";

const CreateProjectModal = ({ onClose, onCreate }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState("");
  const [members, setMembers] = useState([
    { email: "", role: "user" },
  ]);

  /* ------------------ HANDLERS ------------------ */

  const addMemberRow = () => {
    setMembers((prev) => [...prev, { email: "", role: "user" }]);
  };

  const updateMemberEmail = (index, value) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, email: value } : m
      )
    );
  };

  const toggleAdmin = (index) => {
    setMembers((prev) =>
      prev.map((m, i) =>
        i === index
          ? { ...m, role: m.role === "admin" ? "user" : "admin" }
          : m
      )
    );
  };

  const removeMember = (index) => {
    if (members.length === 1) return; // safety
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const validMembers = members.filter(
      (m) => m.email.trim() !== ""
    );

    const project = {
      id: crypto.randomUUID(),
      name,
      rootAdmin: {
        name: user.full_name,
        email: user.email,
      },
      members: validMembers,
      createdAt: new Date().toISOString(),
    };

    onCreate(project);
    onClose();
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <h2>Create Project</h2>

        {/* Project Name */}
        <label>Project Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
        />

        {/* Root Admin */}
        <label>Root Admin</label>
        <input value={user.full_name} disabled />

        {/* Members */}
        {members.map((member, index) => (
          <div className="member-block" key={index}>
            {/* Header */}
            <div className="member-header">
              <label>Add Member</label>

              <div className="member-actions">
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={member.role === "admin"}
                    onChange={() => toggleAdmin(index)}
                  />
                  <span className="ml-1">Admin</span>
                </label>

                <button
                  className="delete-member-btn"
                  onClick={() => removeMember(index)}
                  disabled={members.length === 1}
                  title="Remove member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Email */}
            <input
              type="email"
              className="member-email"
              value={member.email}
              onChange={(e) =>
                updateMemberEmail(index, e.target.value)
              }
              placeholder="user@example.com"
            />
          </div>
        ))}

        {/* Actions */}
        <div className="modal-actions">
          <button className="primary-btn" onClick={addMemberRow}>
            Add Member
          </button>

          <button className="primary-btn" onClick={handleCreate}>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;