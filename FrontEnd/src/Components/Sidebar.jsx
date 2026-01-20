import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowForward, IoMdPricetags } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { RiAlarmWarningFill } from "react-icons/ri";
import { FaFileCode, FaUserFriends, FaHistory } from "react-icons/fa";
import { BsDatabaseFillGear } from "react-icons/bs";
import { SiAdobeaudition } from "react-icons/si";
import { HiTemplate } from "react-icons/hi";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoLogOut, IoSearch } from "react-icons/io5";
import { useAuth } from "../Utility/AuthContext";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: MdSpaceDashboard },
  { id: "alarm", label: "Alarm", icon: RiAlarmWarningFill },
  { id: "trends", label: "Trends", icon: FaArrowTrendUp },
  { id: "data-logger", label: "Data Logger", icon: BsDatabaseFillGear },
  { id: "recipe", label: "Recipe Management", icon: FaFileCode },
  { id: "tag", label: "Tag Management", icon: IoMdPricetags },
  { id: "users", label: "User Management", icon: FaUserFriends },
  { id: "audit", label: "Audit Trail", icon: SiAdobeaudition },
  { id: "templates", label: "Templates", icon: HiTemplate },
];

const PROJECT_REQUIRED = SIDEBAR_ITEMS.map((i) => i.id);

const Sidebar = ({ isClosed, setIsClosed, forceOpen }) => {
  useEffect(() => {
    if (forceOpen) {
      setIsClosed(false);
    }
  }, [forceOpen]);
  const navigate = useNavigate();
  const { logout, hasProjectAccess, loadingProjects } = useAuth();

  const [contextMenu, setContextMenu] = useState(null);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) return;
    setIsClosed((prev) => !prev);
  };

  const handleItemClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingProjects) return;

    if (!hasProjectAccess && PROJECT_REQUIRED.includes(item.id)) {
      return;
    }

    navigate(`/${item.id}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={`sidebar sidebar-enter ${isClosed ? "close" : ""}`}>
      <header>
        <div className="image-text">
          <img src="/app.svg" alt="logo" />
          <div className="text">
            <span className="name">App Square</span>
            <span className="profession">Authorized Personnel Only</span>
          </div>
        </div>

        <IoIosArrowForward
          className={`toggle ${isClosed ? "collapsed" : "expanded"}`}
          onClick={toggleSidebar}
        />
      </header>

      <div className="menu-bar">
        <ul className="menu-links">
          {SIDEBAR_ITEMS.map((item) => {
            const disabled =
              loadingProjects ||
              (!hasProjectAccess && PROJECT_REQUIRED.includes(item.id));

            return (
              <li
                key={item.id}
                className={`side-link ${disabled ? "disabled" : ""}`}
              >
                <div className="link" onClick={(e) => handleItemClick(e, item)}>
                  <item.icon className="icon" />
                  <span className="text">{item.label}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="bottom-content">
          <li className="side-link">
            <div className="link" onClick={() => navigate("/history")}>
              <FaHistory className="icon" />
              <span className="text">History</span>
            </div>
          </li>

          <li className="side-link">
            <div className="link" onClick={handleLogout}>
              <IoLogOut className="icon" />
              <span className="text">Logout</span>
            </div>
          </li>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
