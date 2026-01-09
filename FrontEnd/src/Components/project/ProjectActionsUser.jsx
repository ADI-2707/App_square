import React from "react";
import { Info } from "lucide-react";

const ProjectActionsUser = () => {
  return (
    <div className="project-card card-surface">
      <div className="project-card-icon"><Info /></div>
      <div className="project-card-title">Getting Started</div>
      <div className="project-card-meta">
        Contact an admin to get access or tasks
      </div>
    </div>
  );
};

export default ProjectActionsUser;