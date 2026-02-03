import React from "react";
import { NavLink } from "react-router-dom";

const NavbarLinks = ({ loggedIn }) => (
  <>
    <li><NavLink to="/" className="nav-link">Home</NavLink></li>
    {loggedIn && (
      <li><NavLink to="/dashboard" className="nav-link">Dashboard</NavLink></li>
    )}
    <li><NavLink to="/about" className="nav-link">About</NavLink></li>
    <li><NavLink to="/contact" className="nav-link">Contact</NavLink></li>
  </>
);

export default NavbarLinks;