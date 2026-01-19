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
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setIsPageLoading(true);
      const res = await api.get(`/api/projects/${projectId}/overview/`);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      setTimeout(() => setIsPageLoading(false), 100);
    }
  };

  // SKELETON STATE: Matches the structure of the real page
  if (isPageLoading) {
    return (
      <div className="app-content sidebar-open">
        <div className="page-container">
          <div className="page-inner mx-auto">
            {/* Header Skeleton */}
            <div className="project-hero-skeleton">
               <div className="hero-content-skeleton pulse"></div>
            </div>

            {/* Actions Grid Skeleton */}
            <section className="project-actions-section">
              <div className="skeleton-title-bar pulse"></div>
              <div className="project-grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="project-card skeleton-card">
                    <div className="card-surface skeleton-surface">
                      <div className="skeleton-icon pulse"></div>
                      <div className="skeleton-title pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return <div className="app-content">Project not found</div>;

  return (
    <div className="app-content sidebar-open">
      <div className="page-container fade-in">
        <div className="page-inner mx-auto">
          <ProjectHeader project={project} />

          <section className="project-actions-section">
            <h2 className="project-actions-title">Project Controls</h2>
            <div className="project-grid">
              {project.role === "root_admin" && <ProjectActionsRoot project={project} />}
              {project.role === "admin" && <ProjectActionsAdmin project={project} />}
              {project.role === "user" && <ProjectActionsUser project={project} />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectLanding;