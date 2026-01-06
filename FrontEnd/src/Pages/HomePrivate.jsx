import React, { useEffect, useState } from "react";
import { PlusSquare, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../Components/CreateProjectModal";

/* ---------- Utils ---------- */

const formatUserName = (fullName) => {
  if (!fullName || typeof fullName !== "string") return "";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts.at(-1)[0].toUpperCase()}. ${parts[0]}`;
};

/* ---------- Component ---------- */

const HomePrivate = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = formatUserName(user?.full_name);

  const [projects, setProjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("projects")) || [];
    } catch {
      return [];
    }
  });

  const [showModal, setShowModal] = useState(false);

  /* ---------- Listen from Navbar (Create / Add Project) ---------- */
  useEffect(() => {
    const openModal = () => setShowModal(true);
    window.addEventListener("open-create-project", openModal);

    return () => {
      window.removeEventListener("open-create-project", openModal);
    };
  }, []);

  /* ---------- Create Project ---------- */
  const handleCreate = (project) => {
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setShowModal(false);
  };

  /* ---------- Open Project ---------- */
  const openProject = (project) => {
    localStorage.setItem("activeProject", JSON.stringify(project));
    navigate("/dashboard");
  };

  /* ---------- Render ---------- */
  return (
    <div className="home-private-container">
      {/* Header */}
      <h1 className="home-title mt-5">
        Welcome{displayName ? `, ${displayName}` : ""} 👋
      </h1>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div
          className="empty-project-wrapper mt-10"
          onClick={() => setShowModal(true)}
        >
          <div className="empty-project-card">
            <PlusSquare size={64} strokeWidth={1.5} />
            <p className="empty-project-text">Create your first project</p>
          </div>
        </div>
      ) : (
        /* Project Grid */
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => openProject(project)}
            >
              <div className="project-card-icon">
                <Folder size={36} />
              </div>

              <div className="project-card-title">{project.name}</div>

              <div className="project-card-meta">
                Root Admin: {project.rootAdmin?.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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