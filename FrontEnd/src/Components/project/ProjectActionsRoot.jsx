import React from "react";
import { Users, Shield, Trash2 } from "lucide-react";

const ProjectActionsRoot = () => {
  return (
    <>
      <div className="project-card card-surface">
        <div className="project-card-icon"><Users /></div>
        <div className="project-card-title">Invite Members</div>
        <div className="project-card-meta">
          Send secure invites to users
        </div>
      </div>

      <div className="project-card card-surface">
        <div className="project-card-icon"><Shield /></div>
        <div className="project-card-title">Security Settings</div>
        <div className="project-card-meta">
          Rotate PIN, manage access
        </div>
      </div>

      <div className="project-card card-surface">
        <div className="project-card-icon"><Trash2 /></div>
        <div className="project-card-title">Delete Project</div>
        <div className="project-card-meta">
          Permanently remove project
        </div>
      </div>
    </>
  );
};

export default ProjectActionsRoot;