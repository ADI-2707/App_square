import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Utility/AuthContext";

import { useNavbarEffects } from "./Navbar.hooks";
import NavbarLinks from "./Navbar.links";
import NavbarAuth from "./Navbar.auth";

import "./Navbar.css";

const Navbar = ({ hasSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isInProject = location.pathname.startsWith("/projects/");

  const {
    authenticated: loggedIn,
    user,
    hasProjectAccess,
    openCreateProject,
  } = useAuth();

  const userInitial = user?.email?.charAt(0)?.toUpperCase();
  const { mounted, pendingInvitations } = useNavbarEffects(loggedIn);

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
          <NavbarLinks loggedIn={loggedIn} />

          <div className="nav-auth-mobile">
            <NavbarAuth
              {...{
                loggedIn,
                isInProject,
                hasProjectAccess,
                openCreateProject,
                userInitial,
                pendingInvitations,
                navigate,
              }}
            />
          </div>
        </ul>

        <div className="nav-auth-desktop">
          <NavbarAuth
            {...{
              loggedIn,
              isInProject,
              hasProjectAccess,
              openCreateProject,
              userInitial,
              pendingInvitations,
              navigate,
            }}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;