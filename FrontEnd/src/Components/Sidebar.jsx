import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward, IoMdPricetags } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { IoSearch, IoLogOut } from "react-icons/io5";
import { RiAlarmWarningFill } from "react-icons/ri";
import { FaArrowTrendUp } from "react-icons/fa6";
import { BsDatabaseFillGear } from "react-icons/bs";
import { FaFileCode, FaUserFriends, FaHistory } from "react-icons/fa";
import { SiAdobeaudition } from "react-icons/si";
import { HiTemplate } from "react-icons/hi";

const Sidebar = () => {
  const [isClosed, setIsClosed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem("sidebar-animated");

    if (!hasAnimated) {
      requestAnimationFrame(() => {
        setMounted(true);
        sessionStorage.setItem("sidebar-animated", "true");
      });
    } else {
      setMounted(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsClosed(!isClosed);
  };

  return (
    <nav className={`sidebar ${mounted ? "sidebar-enter" : ""} ${isClosed ? "close" : ""}`}>
      <header>
        <div className="image-text">
          <span className="image">
            <img src="app.svg" alt="logo" />
          </span>
          <div className="text header-text">
            <span className="name">Web App</span>
            <span className="profession uppercase">
              ⚠️Authorized Personnel Only
            </span>
          </div>
        </div>

        <IoIosArrowForward
          className={`toggle ${isClosed ? "collapsed" : "expanded"}`}
          onClick={toggleSidebar}
        />
      </header>

      <div className="menu-bar">
        <div className="menu text-black">
          <li
            className="search-box"
            onClick={(e) => {
              e.stopPropagation();
              if (isClosed) toggleSidebar();
            }}
          >
            <IoSearch className="icon" />
            <input type="search" placeholder="Search..." />
          </li>
          <ul className="menu-links">
            <li className="side-link">
              <Link to="/dashboard" className="link">
                <MdSpaceDashboard className="icon" />
                <span className="text nav-text">Dashboard</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/alarm" className="link">
                <RiAlarmWarningFill className="icon" />
                <span className="text nav-text">Alarm</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/trends" className="link">
                <FaArrowTrendUp className="icon" />
                <span className="text nav-text">Trends</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/data-logger" className="link">
                <BsDatabaseFillGear className="icon" />
                <span className="text nav-text">DataLogger</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/recipe-management" className="link">
                <FaFileCode className="icon" />
                <span className="text nav-text">Recipe Management</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/tag-management" className="link">
                <IoMdPricetags className="icon" />
                <span className="text nav-text">Tag Management</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/user-management" className="link">
                <FaUserFriends className="icon" />
                <span className="text nav-text">User Management</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/audit-trial" className="link">
                <SiAdobeaudition className="icon" />
                <span className="text nav-text">Audit Trial</span>
              </Link>
            </li>
            <li className="side-link">
              <Link to="/templates" className="link">
                <HiTemplate className="icon" />
                <span className="text nav-text">Templates</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="bottom-content">
          <li>
            <Link to="/history" className="link">
              <FaHistory className="icon" />
              <span className="text nav-text">History</span>
            </Link>
          </li>

          <li>
            <Link to="/logout" className="link">
              <IoLogOut className="icon" />
              <span className="text nav-text">Logout</span>
            </Link>
          </li>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
