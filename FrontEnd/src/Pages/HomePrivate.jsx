import React, { useEffect, useState, useRef, useCallback } from "react";
import { PlusSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../Components/CreateProjectModal";
import SecurityPinModal from "../Components/SecurityPinModal";
import ProjectSection from "../Components/ProjectSection";
import api from "../Utility/api";
import { useAuth } from "../Utility/AuthContext";

const LIMIT = 10;

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
  const { createProjectOpen, closeCreateProject, openCreateProject } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [securityPin, setSecurityPin] = useState(null);
  const [accessKey, setAccessKey] = useState(null);
  const [owned, setOwned] = useState([]);
  const [joined, setJoined] = useState([]);
  const [ownedCursor, setOwnedCursor] = useState(null);
  const [joinedCursor, setJoinedCursor] = useState(null);
  const [ownedHasMore, setOwnedHasMore] = useState(true);
  const [joinedHasMore, setJoinedHasMore] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadingOwnedRef = useRef(false);
  const loadingJoinedRef = useRef(false);

  const { authenticated } = useAuth();

  const hasAnyProjects = owned.length > 0 || joined.length > 0;

  const showEmptyState =
    !isInitialLoading &&
    !isSearching &&
    searchResults.length === 0 &&
    !hasAnyProjects;

  useEffect(() => {
    if (!authenticated) return;

    const initFetch = async () => {
      loadingOwnedRef.current = true;
      loadingJoinedRef.current = true;
      setIsInitialLoading(true);

      try {
        const [ownedRes, joinedRes] = await Promise.all([
          api.get("/api/projects/owned/", {
            params: { cursor: null, limit: LIMIT },
          }),
          api.get("/api/projects/joined/", {
            params: { cursor: null, limit: LIMIT },
          }),
        ]);

        setOwned(
          (ownedRes.data.results || []).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          ),
        );
        setOwnedCursor(ownedRes.data.next_cursor);
        setOwnedHasMore(ownedRes.data.has_more);

        setJoined(
          (joinedRes.data.results || []).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          ),
        );
        setJoinedCursor(joinedRes.data.next_cursor);
        setJoinedHasMore(joinedRes.data.has_more);
      } catch (err) {
        console.error("Initial load failed", err);
      } finally {
        loadingOwnedRef.current = false;
        loadingJoinedRef.current = false;
        setIsInitialLoading(false);
      }
    };

    initFetch();
  }, [authenticated]);

  const loadOwned = useCallback(async () => {
    if (!ownedHasMore || loadingOwnedRef.current) return;

    loadingOwnedRef.current = true;
    try {
      const res = await api.get("/api/projects/owned/", {
        params: { cursor: ownedCursor, limit: LIMIT },
      });

      setOwned((prev) => {
        return [...prev, ...res.data.results];
      });

      setOwnedCursor(res.data.next_cursor);
      setOwnedHasMore(res.data.has_more);
    } finally {
      loadingOwnedRef.current = false;
    }
  }, [ownedHasMore, ownedCursor, isInitialLoading]);

  const loadJoined = useCallback(async () => {
    if (!joinedHasMore || loadingJoinedRef.current || isInitialLoading) return;

    loadingJoinedRef.current = true;
    try {
      const res = await api.get("/api/projects/joined/", {
        params: { cursor: joinedCursor, limit: LIMIT },
      });

      setJoined((prev) => {
        return [...prev, ...res.data.results];
      });

      setJoinedCursor(res.data.next_cursor);
      setJoinedHasMore(res.data.has_more);
    } finally {
      loadingJoinedRef.current = false;
    }
  }, [joinedHasMore, joinedCursor, isInitialLoading]);

  const handleCreate = async (payload) => {
    try {
      const res = await api.post("/api/projects/create/", payload);
      setSecurityPin(res.data.pin);
      setAccessKey(res.data.access_key);
      setShowPinModal(true);

      loadingOwnedRef.current = true;
      const refreshRes = await api.get("/api/projects/owned/", {
        params: { cursor: null, limit: LIMIT },
      });

      setOwned(refreshRes.data.results);
      setOwnedCursor(refreshRes.data.next_cursor);
      setOwnedHasMore(refreshRes.data.has_more);
    } catch (err) {
      console.error("Creation failed", err);
      throw err;
    } finally {
      loadingOwnedRef.current = false;
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (searchQuery.length < 2) return;
      try {
        setIsSearching(true);
        const res = await api.get("/api/projects/search/", {
          params: { q: searchQuery },
        });
        setSearchResults(res.data.results);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const openProject = (project) => {
    localStorage.setItem("activeProjectId", project.id);
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="home-private-container">
      <h1 className="home-title">
        Welcome{displayName ? `, ${displayName}` : ""}
      </h1>

      <div className="project-search-bar">
        <input
          type="text"
          placeholder="Search project by ID or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => {}}>Search</button>
      </div>

      {searchResults.length > 0 && (
        <ProjectSection
          title="Search Results"
          projects={searchResults}
          hasMore={false}
          onOpenProject={openProject}
        />
      )}

      {owned.length > 0 && (
        <ProjectSection
          title="Owned Projects"
          projects={owned}
          loadMore={loadOwned}
          hasMore={ownedHasMore}
          onOpenProject={openProject}
        />
      )}

      {joined.length > 0 && (
        <ProjectSection
          title="Joined Projects"
          projects={joined}
          loadMore={loadJoined}
          hasMore={joinedHasMore}
          onOpenProject={openProject}
        />
      )}

      {showEmptyState && (
        <div
          className="empty-project-card mt-10 fade-in"
          onClick={openCreateProject}
        >
          <PlusSquare size={52} className="plus" />
          <p className="empty-project-text">Create new project</p>
        </div>
      )}

      {createProjectOpen && (
        <CreateProjectModal
          onClose={closeCreateProject}
          onCreate={handleCreate}
        />
      )}
      {showPinModal && securityPin && (
        <SecurityPinModal
          pin={securityPin}
          onConfirm={() => {
            setShowPinModal(false);
            setSecurityPin(null);
            setAccessKey(null);
          }}
        />
      )}
    </div>
  );
};

export default HomePrivate;
