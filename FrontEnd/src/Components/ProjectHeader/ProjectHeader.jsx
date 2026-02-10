import React from "react";
import { Copy } from "lucide-react";
import "./ProjectHeader.css";

const ProjectHeader = ({ project }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(project.public_code);
    } catch (err) {
      console.error("Failed to copy project code");
    }
  };

  return (
    <section className="project-hero">
      <div className="project-hero-inner card-surface">
        <h1 className="project-title">
          {project.name}

          <span className="project-code-inline">
            {project.public_code}
            <button
              className="copy-btn"
              onClick={handleCopy}
              title="Copy project code"
            >
              <Copy size={14} />
            </button>
          </span>
        </h1>

        <div className="project-role">
          Role: <strong>{project.role.toUpperCase()}</strong>
        </div>
      </div>
    </section>
  );
};

export default ProjectHeader;