import React from "react";
import { PlusSquare } from "lucide-react";

const formatUserName = (fullName) => {
  if (!fullName || typeof fullName !== "string") return "";

  const parts = fullName.trim().split(" ");

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const lastInitial = lastName.charAt(0).toUpperCase();

  return `${lastInitial}. ${firstName}`;
};

const HomePrivate = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user?.full_name || "";
  const displayName = formatUserName(fullName);

  // TEMP: no projects yet
  const projects = [];

  return (
    <div className="home-private-container">
      {/* Header */}
      <div className="home-header">
        <h1 className="home-title">
          Welcome{displayName ? `, ${displayName}` : ""} 👋
        </h1>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="empty-project-wrapper">
          <div className="empty-project-card">
            <div className="empty-project-icon">
              <PlusSquare size={64} strokeWidth={1.5} />
            </div>
            <p className="empty-project-text">
              Create your first project
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePrivate;
