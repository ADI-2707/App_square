import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Utility/api";

import ProjectHeader from "../Components/project/ProjectHeader";
import ProjectActionsRoot from "../Components/project/ProjectActionsRoot";
import ProjectActionsAdmin from "../Components/project/ProjectActionsAdmin";
import ProjectActionsUser from "../Components/project/ProjectActionsUser";

const ProjectLanding = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/projects/${projectId}/overview/`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 150);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-inner">
          <div className="project-hero-skeleton pulse" />
        </div>
      </div>
    );
  }

  if (!project) return <div className="page-container">Project not found</div>;

  return (
    <div className="page-container fade-in">
      <div className="page-inner">
        <ProjectHeader project={project} />
        <section className="project-overview-section">
          <div className="project-overview-header">
            <h2 className="project-overview-title">Project Overview</h2>
            <p className="project-overview-subtitle">
              Live insights, trends, and operational visibility
            </p>
          </div>

          <div className="project-overview-controls top">
            <span className="overview-control-placeholder">
              Controls will appear here
            </span>
          </div>

          <div className="project-overview-canvas">
            <div className="overview-empty-state">
              Dashboard components will appear here
            </div>
          </div>

          <div className="project-overview-controls bottom">
            <span className="overview-control-placeholder">
              Additional controls / legends
            </span>
          </div>
        </section>

        <section className="project-actions-section">
          <h2 className="project-actions-title">Project Controls</h2>
          <div className="project-grid">
            {project.role === "root_admin" && (
              <ProjectActionsRoot project={project} />
            )}
            {project.role === "admin" && (
              <ProjectActionsAdmin project={project} />
            )}
            {project.role === "user" && (
              <ProjectActionsUser project={project} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectLanding;