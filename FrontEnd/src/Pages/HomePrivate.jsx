import React, { useEffect, useState } from "react";
import { PlusSquare, Folder } from "lucide-react";
import CreateProjectModal from "../Components/CreateProjectModal";

const formatUserName = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts.at(-1)[0].toUpperCase()}. ${parts[0]}`;
};

const HomePrivate = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = formatUserName(user?.full_name);

  const [projects, setProjects] = useState(
    JSON.parse(localStorage.getItem("projects")) || []
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const open = () => setShowModal(true);
    window.addEventListener("open-create-project", open);
    return () => window.removeEventListener("open-create-project", open);
  }, []);

  const handleCreate = (project) => {
    const updated = [...projects, project];
    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
    window.dispatchEvent(new Event("projects-updated"));
  };

  return (
    <div className="home-private-container">
      <h1 className="home-title">
        Welcome{displayName ? `, ${displayName}` : ""} 👋
      </h1>

      {projects.length === 0 ? (
        <div className="empty-project-wrapper" onClick={() => setShowModal(true)}>
          <div className="empty-project-card">
            <PlusSquare size={64} />
            <p>Create your first project</p>
          </div>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-card">
              <div className="project-card-icon">
                <Folder size={36} />
              </div>
              <h3>{p.name}</h3>
              <span className="project-role">
                Root Admin
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default HomePrivate;