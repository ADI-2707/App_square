import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowForward, IoMdPricetags } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { RiAlarmWarningFill } from "react-icons/ri";
import { FaFileCode, FaUserFriends, FaHistory } from "react-icons/fa";
import { BsDatabaseFillGear } from "react-icons/bs";
import { SiAdobeaudition } from "react-icons/si";
import { HiTemplate } from "react-icons/hi";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { useAuth } from "../Utility/AuthContext";

const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: MdSpaceDashboard,
    requiresProject: true,
    actions: [
      {
        id: "view-dashboard",
        label: "View Dashboard",
        action: "viewDashboard",
      },
      {
        id: "create-dashboard",
        label: "Create Dashboard",
        action: "createDashboard",
      },
    ],
  },
  {
    id: "alarm",
    label: "Alarm",
    icon: RiAlarmWarningFill,
    requiresProject: true,
    actions: [
      { id: "view-alarm", label: "View Alarms", action: "viewAlarm" },
      { id: "create-alarm", label: "Create Alarms", action: "createAlarm" },
    ],
  },
  {
    id: "trends",
    label: "Trends",
    icon: FaArrowTrendUp,
    requiresProject: true,
    actions: [
      { id: "view-trends", label: "View Trends", action: "viewTrends" },
      {
        id: "compare-trends",
        label: "Compare Trends",
        action: "compareTrends",
      },
    ],
  },
  {
    id: "data-logger",
    label: "Data Logger",
    icon: BsDatabaseFillGear,
    requiresProject: true,
    actions: [
      { id: "view-logs", label: "View Logs", action: "viewLogs" },
      { id: "log-settings", label: "Log Settings", action: "logSettings" },
    ],
  },
  {
    id: "recipe",
    label: "Recipe Management",
    icon: FaFileCode,
    requiresProject: true,
    actions: [
      { id: "view-recipe", label: "View Recipes", action: "open-view-recipe" },
      {
        id: "create-recipe",
        label: "Create Recipe",
        action: "open-create-recipe",
      },
    ],
  },
  {
    id: "tag",
    label: "Tag Management",
    icon: IoMdPricetags,
    requiresProject: true,
    actions: [
      { id: "add-tags", label: "Add Tags", action: "addTags" },
      { id: "manage-tags", label: "Manage Tags", action: "manageTags" },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: FaUserFriends,
    requiresProject: true,
    actions: [
      { id: "see-users", label: "See Users", action: "seeUsers" },
      { id: "add-users", label: "Add Users", action: "addUsers" },
    ],
  },
  {
    id: "audit",
    label: "Audit Trail",
    icon: SiAdobeaudition,
    requiresProject: true,
    actions: [
      { id: "audit-history", label: "Audit History", action: "auditHistory" },
      { id: "analysis", label: "Analysis", action: "analysis" },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    icon: HiTemplate,
    requiresProject: true,
    actions: [
      { id: "add-templates", label: "Add Templates", action: "addTemplates" },
      {
        id: "create-templates",
        label: "Create Templates",
        action: "createTemplates",
      },
    ],
  },
];

const Sidebar = ({ isClosed, setIsClosed }) => {
  const { logout, loadingProjects } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const isInsideProject = location.pathname.startsWith("/projects/");
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) return;
    setIsClosed((prev) => !prev);
  };

  const toggleMenu = (itemId) => {
    if (isClosed) {
      setIsClosed(false);
      requestAnimationFrame(() => {
        setExpandedItem(itemId);
      });
      return;
    }
    setExpandedItem((prev) => (prev === itemId ? null : itemId));
  };

  const fireAction = (eventName) => {
    window.dispatchEvent(new CustomEvent(eventName));
  };

  const setTooltipY = (e) => {
    const icon = e.currentTarget.querySelector(".icon");
    if (!icon) return;

    const rect = icon.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;

    e.currentTarget.style.setProperty("--tooltip-y", `${centerY}px`);
  };

  useEffect(() => {
    if (isClosed) {
      setExpandedItem(null);
    }
  }, [isClosed]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isClosed ? "88px" : "250px",
    );
  }, [isClosed]);

  return (
    <div className="sidebar-wrapper">
      <nav
        ref={sidebarRef}
        className={`sidebar sidebar-enter ${isClosed ? "close" : ""}`}
      >
        <header>
          <div className="image-text">
            <img src="/app.svg" alt="logo" />
            <div className="text">
              <span className="name">App Square</span>
              <p className="profession">Authorized Personnel Only</p>
            </div>
          </div>

          <IoIosArrowForward
            className={`toggle ${isClosed ? "collapsed" : "expanded"}`}
            onClick={() => {
              console.log("arrow clicked", isClosed);
              toggleSidebar();
            }}
          />
        </header>

        <div className="menu-bar">
          <ul className="menu-links">
            {SIDEBAR_ITEMS.map((item) => {
              const disabled = loadingProjects || !isInsideProject;
              const isExpanded = expandedItem === item.id;

              return (
                <li
                  key={item.id}
                  data-label={item.label}
                  onMouseEnter={setTooltipY}
                  className={`side-link ${disabled ? "disabled" : ""} ${
                    isExpanded ? "expanded" : ""
                  }`}
                >
                  <div
                    className="link"
                    onClick={() => !disabled && toggleMenu(item.id)}
                  >
                    <item.icon className="icon" />
                    <span className="text">{item.label}</span>
                  </div>

                  <ul className={`submenu-inline ${isExpanded ? "open" : ""}`}>
                    {item.actions.map((action) => (
                      <li
                        key={action.id}
                        className="submenu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          fireAction(action.action);
                        }}
                      >
                        {action.label}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>

          <div className="bottom-content">
            <li
              className="side-link"
              data-label="History"
              onMouseEnter={setTooltipY}
            >
              <div className="link" onClick={() => navigate("/history")}>
                <FaHistory className="icon" />
                <span className="text">History</span>
              </div>
            </li>

            <li
              className="side-link"
              data-label="Logout"
              onMouseEnter={setTooltipY}
            >
              <div className="link" data-label="Logout" onClick={logout}>
                <IoLogOut className="icon" />
                <span className="text">Logout</span>
              </div>
            </li>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
