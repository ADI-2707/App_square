import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Utility/api";

import ProjectHeader from "../Components/project/ProjectHeader";
import ProjectActionsRoot from "../Components/project/ProjectActionsRoot";
import ProjectActionsAdmin from "../Components/project/ProjectActionsAdmin";
import ProjectActionsUser from "../Components/project/ProjectActionsUser";

const ProjectLanding = () => {
  const { projectId } = useParams();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/overview/`);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-content sidebar-open">
        <div className="skeleton" />
      </div>
    );
  }

  if (!project) {
    return <div className="app-content">Project not found</div>;
  }

  return (
    <div className="app-content sidebar-open">
      <div className="page-container">
        <div className="page-inner">
          <ProjectHeader project={project} />

          {/* ACTIONS SECTION */}
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
    </div>
  );
};

export default ProjectLanding;
