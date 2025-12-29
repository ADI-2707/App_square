import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem("navbar-animated");

    if (!hasAnimated) {
      // first load / refresh
      requestAnimationFrame(() => {
        setMounted(true);
        sessionStorage.setItem("navbar-animated", "true");
      });
    } else {
      // route change → show instantly
      setMounted(true);
    }
  }, []);
  return (
    <nav className={`navbar ${mounted ? "navbar-enter" : ""}`}>
      <div className="navbar-inner">
        <div className="nav-logo">
          <img src="app.svg" className="h-9 w-9" alt="Logo" />
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </div>

        {/* Nav Links */}
        <ul className={`nav-links ${isOpen ? "active" : ""}`}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
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
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Contact
            </NavLink>
          </li>
          <div className="nav-auth-mobile">
            <button className="button" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="button" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="nav-auth-desktop">
          <button className="button" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="button" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
