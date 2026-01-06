import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, getUser } from "../Utility/auth";

const Navbar = ({ isSidebarClosed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const loggedIn = isAuthenticated();
  const user = getUser();
  const userInitial = user?.email?.charAt(0)?.toUpperCase();

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
        {/* Logo */}
        <div className="nav-logo">
          <img src="app.svg" className="h-9 w-9" alt="Logo" />
        </div>

        {/* Hamburger (mobile) */}
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </div>

        {/* Nav links */}
        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li>
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>
          </li>

          {loggedIn && (
            <li>
              <NavLink
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Dashboard
              </NavLink>
            </li>
          )}

          <li>
            <NavLink
              to="/about"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              About
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/contact"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Contact
            </NavLink>
          </li>

          {/* Mobile auth */}
          <div className="nav-auth-mobile">
            {!loggedIn ? (
              <>
                <button className="button" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="button" onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  className="button"
                  onClick={() => navigate("/home")}
                >
                  Create / Add Project
                </button>
                <button
                  className="user-avatar"
                  onClick={() => navigate("/user")}
                >
                  {userInitial}
                </button>
              </>
            )}
          </div>
        </ul>

        {/* Desktop auth */}
        <div className="nav-auth-desktop">
          {!loggedIn ? (
            <>
              <button className="button" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="button" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                className="button"
                onClick={() => navigate("/home")}
              >
                Create / Add Project
              </button>
              <button
                className="user-avatar"
                onClick={() => navigate("/user")}
              >
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