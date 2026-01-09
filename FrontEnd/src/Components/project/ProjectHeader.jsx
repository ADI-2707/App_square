import React from "react";
import { Copy } from "lucide-react";

const ProjectHeader = ({ project }) => {
  return (
    <div className="project-hero">
      <div className="project-hero-inner">
        <h1 className="project-title">{project.name}</h1>

        <div className="project-meta-row">
          <span className="project-code">{project.public_code}</span>

          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(project.public_code)}
            title="Copy project code"
          >
            <Copy size={14} />
          </button>
        </div>

        <div className="project-role">
          Role: {project.role.replace("_", " ").toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;