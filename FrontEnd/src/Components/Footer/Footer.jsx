import React from "react";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span className="footer-left">
          © {year} AppSquare
        </span>

        <nav className="footer-links">
          <a href="#" className="footer-link">Docs</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Security</a>
          <a href="#" className="footer-link">Status</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;