import React, { useState } from "react";
import { X } from "lucide-react";

const CreateProjectModal = ({ onClose, onCreate }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;

    const project = {
      id: crypto.randomUUID(),
      name,
      rootAdmin: {
        name: user.full_name,
        email: user.email,
      },
      members: [],
      createdAt: new Date().toISOString(),
    };

    onCreate(project);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <h2>Create Project</h2>

        <label>Project Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
        />

        <label>Root Admin</label>
        <input value={user.full_name} disabled />

        <button className="primary-btn" onClick={handleCreate}>
          Create Project
        </button>
      </div>
    </div>
  );
};

export default CreateProjectModal;