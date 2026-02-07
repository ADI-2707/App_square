import React from "react";
import { Users } from "lucide-react";

const ProjectActionsAdmin = ({ onManageMembers }) => {
  return (
    <div
      className="project-card card-surface"
      onClick={onManageMembers}
    >
      <div className="project-card-icon">
        <Users />
      </div>

      <div className="project-card-title">
        Manage Members
      </div>

      <div className="project-card-meta">
        View project members
      </div>
    </div>
  );
};

export default ProjectActionsAdmin;