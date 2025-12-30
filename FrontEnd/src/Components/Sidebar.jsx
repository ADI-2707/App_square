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

/* ===================== DATA ===================== */

const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: MdSpaceDashboard,
    route: "/dashboard",
    actions: [
      { label: "Open Dashboard", action: "open" },
      { label: "Open in New Tab", action: "new-tab" },
      { label: "View Stats", action: "stats" },
    ],
  },
  {
    id: "alarm",
    label: "Alarm",
    icon: RiAlarmWarningFill,
    route: "/alarm",
    actions: [
      { label: "View Active Alarms", action: "open" },
      { label: "Alarm History", action: "history" },
      { label: "Silence All", action: "silence" },
    ],
  },
  {
    id: "trends",
    label: "Trends",
    icon: FaArrowTrendUp,
    route: "/trends",
    actions: [
      { label: "View Trends", action: "open" },
      { label: "Export Data", action: "export" },
    ],
  },
  {
    id: "data-logger",
    label: "Data Logger",
    icon: BsDatabaseFillGear,
    route: "/data-logger",
    actions: [
      { label: "Open Logger", action: "open" },
      { label: "Download Logs", action: "download" },
    ],
  },
  {
    id: "recipe",
    label: "Recipe Management",
    icon: FaFileCode,
    route: "/recipe-management",
    actions: [
      { label: "View Recipes", action: "open" },
      { label: "Create Recipe", action: "create" },
    ],
  },
  {
    id: "tag",
    label: "Tag Management",
    icon: IoMdPricetags,
    route: "/tag-management",
    actions: [
      { label: "View Tags", action: "open" },
      { label: "Add Tag", action: "add" },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: FaUserFriends,
    route: "/user-management",
    actions: [
      { label: "View Users", action: "open" },
      { label: "Add User", action: "add" },
      { label: "Permissions", action: "permissions" },
    ],
  },
  {
    id: "audit",
    label: "Audit Trail",
    icon: SiAdobeaudition,
    route: "/audit-trial",
    actions: [
      { label: "View Logs", action: "open" },
      { label: "Export Audit", action: "export" },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    icon: HiTemplate,
    route: "/templates",
    actions: [
      { label: "Open Templates", action: "open" },
      { label: "Create Template", action: "create" },
    ],
  },
];

/* ===================== COMPONENT ===================== */

const Sidebar = () => {
  const navigate = useNavigate();

  /* 🔒 Always start collapsed */
  const [isClosed, setIsClosed] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  /* ===================== EFFECTS ===================== */

  /* Entrance animation */
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  /* Close context menu on outside click */
  useEffect(() => {
    const close = () =>
      setContextMenu((prev) => ({ ...prev, visible: false }));

    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* ===================== HANDLERS ===================== */

  /* 🚫 Prevent expanding sidebar on mobile */
  const toggleSidebar = () => {
    if (window.innerWidth <= 768) return;
    setIsClosed((prev) => !prev);
  };

  const handleItemClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleAction = (action, item) => {
    switch (action) {
      case "open":
        navigate(item.route);
        break;
      case "new-tab":
        window.open(item.route, "_blank");
        break;
      case "history":
        navigate(`${item.route}/history`);
        break;
      case "add":
      case "create":
        navigate(`${item.route}/create`);
        break;
      case "permissions":
        navigate(`${item.route}/permissions`);
        break;
      case "export":
        console.log("Exporting from", item.label);
        break;
      case "download":
        console.log("Downloading logs");
        break;
      case "silence":
        alert("All alarms silenced");
        break;
      case "stats":
        console.log("Viewing stats");
        break;
      default:
        console.warn("Unknown action:", action);
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <>
      <nav
        className={`sidebar sidebar-enter ${isClosed ? "close" : ""} ${isClosed ? "close" : ""}`}
      >
        {/* ===== HEADER ===== */}
        <header>
          <div className="image-text">
            <span className="image">
              <img src="app.svg" alt="logo" />
            </span>

            <div className="text header-text">
              <span className="name">Web App</span>
              <span className="profession uppercase">
                ⚠️ Authorized Personnel Only
              </span>
            </div>
          </div>

          {/* ❌ Hidden on mobile via CSS, disabled via JS */}
          <IoIosArrowForward
            className={`toggle ${isClosed ? "collapsed" : "expanded"}`}
            onClick={toggleSidebar}
          />
        </header>

        {/* ===== MENU ===== */}
        <div className="menu-bar">
          <div className="menu">
            <li className="search-box">
              <IoSearch className="icon" />
              <input type="search" placeholder="Search..." />
            </li>

            <ul className="menu-links">
              {SIDEBAR_ITEMS.map((item) => (
                <li key={item.id} className="side-link">
                  <div
                    className="link"
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <item.icon className="icon" />
                    <span className="text nav-text">{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="bottom-content">
            <li className="side-link">
              <div
                className="link"
                onClick={(e) =>
                  handleItemClick(e, {
                    label: "History",
                    route: "/history",
                    actions: [{ label: "Open History", action: "open" }],
                  })
                }
              >
                <FaHistory className="icon" />
                <span className="text nav-text">History</span>
              </div>
            </li>

            <li className="side-link">
              <div className="link">
                <IoLogOut className="icon" />
                <span className="text nav-text">Logout</span>
              </div>
            </li>
          </div>
        </div>
      </nav>

      {/* ===== CONTEXT MENU ===== */}
      {contextMenu.visible && contextMenu.item && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.item.actions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                handleAction(opt.action, contextMenu.item);
                setContextMenu({ visible: false, item: null });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Sidebar;