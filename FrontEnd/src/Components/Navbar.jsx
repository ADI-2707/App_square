import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, getUser } from "../Utility/auth";

const Navbar = ({ isSidebarClosed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);

  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const user = getUser();
  const userInitial = user?.email?.charAt(0)?.toUpperCase();

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    setHasProjects(projects.length > 0);

    const sync = () => {
      const updated = JSON.parse(localStorage.getItem("projects")) || [];
      setHasProjects(updated.length > 0);
    };

    window.addEventListener("projects-updated", sync);
    return () => window.removeEventListener("projects-updated", sync);
  }, []);

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem("navbar-animated");
    if (!hasAnimated) {
      requestAnimationFrame(() => {
        setMounted(true);
        sessionStorage.setItem("navbar-animated", "true");
      });
    } else {
      setMounted(true);
    }
  }, []);

  const openCreateProject = () => {
    navigate("/home");
    window.dispatchEvent(new Event("open-create-project"));
  };

  return (
    <nav
      className={`navbar ${mounted ? "navbar-enter" : ""} ${
        loggedIn
          ? isSidebarClosed
            ? "sidebar-closed"
            : "sidebar-open"
          : ""
      }`}
    >
      <div className="navbar-inner">
        <div className="nav-logo">
          <img src="app.svg" className="h-9 w-9" alt="Logo" />
        </div>

        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </div>

        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li><NavLink to="/" className="nav-link">Home</NavLink></li>
          {loggedIn && <li><NavLink to="/dashboard" className="nav-link">Dashboard</NavLink></li>}
          <li><NavLink to="/about" className="nav-link">About</NavLink></li>
          <li><NavLink to="/contact" className="nav-link">Contact</NavLink></li>

          <div className="nav-auth-mobile">
            {!loggedIn ? (
              <>
                <button className="button" onClick={() => navigate("/login")}>Login</button>
                <button className="button" onClick={() => navigate("/signup")}>Sign Up</button>
              </>
            ) : (
              <>
                <button className="button" onClick={openCreateProject}>
                  {hasProjects ? "Add Project" : "Create Project"}
                </button>
                <button className="user-avatar">{userInitial}</button>
              </>
            )}
          </div>
        </ul>

        <div className="nav-auth-desktop">
          {!loggedIn ? (
            <>
              <button className="button" onClick={() => navigate("/login")}>Login</button>
              <button className="button" onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          ) : (
            <>
              <button className="button" onClick={openCreateProject}>
                {hasProjects ? "Add Project" : "Create Project"}
              </button>
              <button className="user-avatar">{userInitial}</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;