import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaHistory } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";

import { useAuth } from "../../Utility/AuthContext";
import { SIDEBAR_ITEMS } from "./Sidebar.constants.js";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isClosed, setIsClosed }) => {
  const { logout, loadingProjects } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const [expandedItem, setExpandedItem] = useState(null);
  const isInsideProject = location.pathname.startsWith("/projects/");

  const visibleItems = useMemo(() => {
    if (!expandedItem) return SIDEBAR_ITEMS;
    const index = SIDEBAR_ITEMS.findIndex(i => i.id === expandedItem);
    return index === -1
      ? SIDEBAR_ITEMS
      : [SIDEBAR_ITEMS[index], ...SIDEBAR_ITEMS.slice(index + 1)];
  }, [expandedItem]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) return;
    setIsClosed(prev => !prev);
  };

  const toggleMenu = (id) => {
    if (isClosed) {
      setIsClosed(false);
      requestAnimationFrame(() => setExpandedItem(id));
      return;
    }
    setExpandedItem(prev => (prev === id ? null : id));
  };

  const fireAction = (name) => {
    window.dispatchEvent(new CustomEvent(name));
  };

  const setTooltipY = (e) => {
    const icon = e.currentTarget.querySelector(`.${styles.icon}`);
    if (!icon) return;
    const rect = icon.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--tooltip-y",
      `${rect.top + rect.height / 2}px`
    );
  };

  useEffect(() => {
    if (isClosed) setExpandedItem(null);
  }, [isClosed]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isClosed ? "88px" : "250px"
    );
  }, [isClosed]);

  return (
    <div className={styles.wrapper}>
      <nav
        ref={sidebarRef}
        className={`${styles.sidebar} ${styles.enter} ${isClosed ? styles.closed : ""}`}
      >
        <header className={styles.header}>
          <div className={styles.brand}>
            <img src="/app.svg" alt="logo" />
            <div className={styles.brandText}>
              <span className={styles.name}>App Square</span>
              <p className={styles.profession}>Authorized Personnel Only</p>
            </div>
          </div>

          <IoIosArrowForward
            className={`${styles.toggle} ${isClosed ? styles.collapsed : styles.expanded}`}
            onClick={toggleSidebar}
          />
        </header>

        <div className={styles.menuBar}>
          <ul className={styles.menu}>
            {visibleItems.map(item => {
              const disabled = loadingProjects || !isInsideProject;
              const expanded = expandedItem === item.id;
              const Icon = item.icon;

              return (
                <li
                  key={item.id}
                  data-label={item.label}
                  onMouseEnter={setTooltipY}
                  className={`${styles.sideLink} ${disabled ? styles.disabled : ""}`}
                >
                  <div
                    className={styles.link}
                    onClick={() => !disabled && toggleMenu(item.id)}
                  >
                    <Icon className={styles.icon} />
                    <span className={styles.text}>{item.label}</span>
                  </div>

                  <ul className={`${styles.submenu} ${expanded ? styles.open : ""}`}>
                    {item.actions.map(action => (
                      <li
                        key={action.id}
                        className={styles.submenuItem}
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

          <div className={styles.bottom}>
            <li className={styles.sideLink} data-label="History" onMouseEnter={setTooltipY}>
              <div className={styles.link} onClick={() => navigate("/history")}>
                <FaHistory className={styles.icon} />
                <span className={styles.text}>History</span>
              </div>
            </li>

            <li className={styles.sideLink} data-label="Logout" onMouseEnter={setTooltipY}>
              <div className={styles.link} onClick={logout}>
                <IoLogOut className={styles.icon} />
                <span className={styles.text}>Logout</span>
              </div>
            </li>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;