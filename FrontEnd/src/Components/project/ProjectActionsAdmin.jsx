import React from "react";
import { Users } from "lucide-react";

const ProjectActionsAdmin = () => {
  return (
    <div className="project-card card-surface">
      <div className="project-card-icon"><Users /></div>
      <div className="project-card-title">Manage Members</div>
      <div className="project-card-meta">
        View and invite members
      </div>
    </div>
  );
};

export default ProjectActionsAdmin;