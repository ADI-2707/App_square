import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Utility/AuthContext";

const Navbar = ({ hasSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const { authenticated: loggedIn, user, hasProjectAccess, openCreateProject } = useAuth();
  const userInitial = user?.email?.charAt(0)?.toUpperCase();

  useEffect(() => {
    const animated = sessionStorage.getItem("navbar-animated");
    if (!animated) {
      requestAnimationFrame(() => {
        setMounted(true);
        sessionStorage.setItem("navbar-animated", "true");
      });
    } else {
      setMounted(true);
    }
  }, []);

  return (
    <nav className={`navbar ${mounted ? "navbar-enter" : ""}`}>
      <div className="navbar-inner">
        <div className="nav-logo">
          <img src="/app.svg" className="h-9 w-9" alt="Logo" />
        </div>

        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </div>

        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li><NavLink to="/" className="nav-link">Home</NavLink></li>
          {loggedIn && (
            <li><NavLink to="/dashboard" className="nav-link">Dashboard</NavLink></li>
          )}
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
                <button className="button" onClick={() => {navigate('/home'); openCreateProject()}}>
                  {hasProjectAccess ? "Add Project" : "Create Project"}
                </button>
                <button className="user-avatar" onClick={() => navigate("/account")}>
                  {userInitial}
                </button>
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
                {hasProjectAccess ? "Add Project" : "Create Project"}
              </button>
              <button className="user-avatar" onClick={() => navigate("/account")}>
                {userInitial}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;