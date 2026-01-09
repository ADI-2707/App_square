import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

const ProjectHeader = ({ project }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(project.public_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="project-hero">
      <div className="project-hero-inner">
        <h1 className="project-title">{project.name}</h1>
        <div className="project-meta-row">
          <span className="project-code">{project.public_code}</span>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
          </button>
        </div>
        <div className="project-role">
          Role: <span className="font-bold">{project.role.replace("_", " ").toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;