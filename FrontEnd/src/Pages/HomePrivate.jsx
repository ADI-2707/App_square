import React, { useEffect, useState, useRef } from "react";
import { PlusSquare, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../Components/CreateProjectModal";
import SecurityPinModal from "../Components/SecurityPinModal";
import api from "../Utility/api";

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
  const debounceRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = formatUserName(user?.full_name);

  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPinModal, setShowPinModal] = useState(false);
  const [securityPin, setSecurityPin] = useState(null);

  /* ---------- Fetch My Projects ---------- */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/projects/my/");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ---------- Open modal from navbar ---------- */
  useEffect(() => {
    const openModal = () => setShowModal(true);
    window.addEventListener("open-create-project", openModal);
    return () =>
      window.removeEventListener("open-create-project", openModal);
  }, []);

  /* ---------- Create Project ---------- */
  const handleCreate = async (payload) => {
    const res = await api.post("/api/projects/create/", payload);
    setSecurityPin(res.data.pin);
    setShowPinModal(true);
    fetchProjects();
    return res.data;
  };

  /* ---------- Debounced Search ---------- */
  useEffect(() => {
    if (!searchQuery.trim()) return;

    // clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // 🔒 Minimum length rule
      if (searchQuery.length < 3) return;

      console.log("Debounced search:", searchQuery);

      // 🔗 future API call
      // api.get(`/api/projects/search?q=${searchQuery}`)
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleSearchClick = () => {
    if (!searchQuery.trim()) return;
    console.log("Manual search:", searchQuery);
  };

  /* ---------- Open Project ---------- */
  const openProject = (project) => {
    localStorage.setItem("activeProjectId", project.id);
    navigate(`/projects/${project.id}`);
  };

  /* ---------- Render ---------- */
  return (
    <div className="home-private-container">
      <h1 className="home-title mt-5">
        Welcome{displayName ? `, ${displayName}` : ""}
      </h1>

      {/* 🔍 SEARCH BAR */}
          <div className="project-search-bar">
            <input
              type="text"
              placeholder="Search project by ID or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearchClick}>Search</button>
          </div>

      {!loading && projects.length === 0 && !error && (
        <div className="empty-project-wrapper mt-10">

          {/* CREATE CARD */}
          <div
            className="empty-project-card card-surface"
            onClick={() => setShowModal(true)}
          >
            <PlusSquare size={64} strokeWidth={1.5} className="plus" />
            <p className="empty-project-text">Create your first project</p>
          </div>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card card-surface"
              onClick={() => openProject(project)}
            >
              <div className="project-card-icon">
                <Folder size={36} />
              </div>
              <div className="project-card-title">{project.name}</div>
              <div className="project-card-meta">
                Role: {project.role.toUpperCase()}
              </div>
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

      {showPinModal && securityPin && (
        <SecurityPinModal
          pin={securityPin}
          onConfirm={() => {
            setShowPinModal(false);
            setSecurityPin(null);
          }}
        />
      )}
    </div>
  );
};

export default HomePrivate;