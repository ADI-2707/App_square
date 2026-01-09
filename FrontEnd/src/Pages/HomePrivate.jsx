import React, { useEffect, useState, useRef } from "react";
import { PlusSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../Components/CreateProjectModal";
import SecurityPinModal from "../Components/SecurityPinModal";
import ProjectSection from "../Components/ProjectSection";
import api from "../Utility/api";

const LIMIT = 10;

/* ---------- Utils ---------- */
const formatUserName = (fullName) => {
  if (!fullName || typeof fullName !== "string") return "";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts.at(-1)[0].toUpperCase()}. ${parts[0]}`;
};

const HomePrivate = () => {
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = formatUserName(user?.full_name);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [securityPin, setSecurityPin] = useState(null);

  const [owned, setOwned] = useState([]);
  const [joined, setJoined] = useState([]);

  const [ownedCursor, setOwnedCursor] = useState(null);
  const [joinedCursor, setJoinedCursor] = useState(null);

  const [ownedHasMore, setOwnedHasMore] = useState(true);
  const [joinedHasMore, setJoinedHasMore] = useState(true);

  /* ---------- Initial Load ---------- */
  useEffect(() => {
    loadOwned();
    loadJoined();
  }, []);

  const loadOwned = async () => {
    if (!ownedHasMore) return;

    const res = await api.get("/api/projects/owned/", {
      params: { cursor: ownedCursor, limit: LIMIT },
    });

    setOwned((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      res.data.results.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
    setOwnedCursor(res.data.next_cursor);
    setOwnedHasMore(res.data.has_more);
  };

  const loadJoined = async () => {
    if (!joinedHasMore) return;

    const res = await api.get("/api/projects/joined/", {
      params: { cursor: joinedCursor, limit: LIMIT },
    });

    setJoined((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      res.data.results.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
    setJoinedCursor(res.data.next_cursor);
    setJoinedHasMore(res.data.has_more);
  };

  /* ---------- Modal trigger from navbar ---------- */
  useEffect(() => {
    const openModal = () => setShowModal(true);
    window.addEventListener("open-create-project", openModal);
    return () => window.removeEventListener("open-create-project", openModal);
  }, []);

  /* ---------- Create Project ---------- */
  const handleCreate = async (payload) => {
    const res = await api.post("/api/projects/create/", payload);

    setSecurityPin(res.data.pin);
    setShowPinModal(true);

    // Reset owned projects pagination
    setOwned([]);
    setOwnedCursor(null);
    setOwnedHasMore(true);

    await loadOwned();
  };

  /* ---------- Search (UI-only for now) ---------- */
  useEffect(() => {
    if (!searchQuery.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (searchQuery.length < 3) return;
      console.log("Debounced search:", searchQuery);
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
      <h1 className="home-title">
        Welcome{displayName ? `, ${displayName}` : ""}
      </h1>

      {/* SEARCH */}
      <div className="project-search-bar">
        <input
          type="text"
          placeholder="Search project by ID or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearchClick}>Search</button>
      </div>

      <>
        <ProjectSection
          title="Owned Projects"
          projects={owned}
          loadMore={loadOwned}
          hasMore={ownedHasMore}
        />

        <ProjectSection
          title="Joined Projects"
          projects={joined}
          loadMore={loadJoined}
          hasMore={joinedHasMore}
        />

        {/* CREATE PROJECT CARD */}
        <div
          className="empty-project-card mt-10"
          onClick={() => setShowModal(true)}
        >
          <PlusSquare size={52} className="plus" />
          <p className="empty-project-text">Create new project</p>
        </div>
      </>

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
