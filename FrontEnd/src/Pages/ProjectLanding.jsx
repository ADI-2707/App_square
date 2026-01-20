import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Utility/api";

import ProjectHeader from "../Components/project/ProjectHeader";
import ProjectActionsRoot from "../Components/project/ProjectActionsRoot";
import ProjectActionsAdmin from "../Components/project/ProjectActionsAdmin";
import ProjectActionsUser from "../Components/project/ProjectActionsUser";

import ViewRecipeModal from "../Components/project/ViewRecipeModal";
import CreateRecipeModal from "../Components/project/CreateRecipeModal";
import RecipeTable from "../Components/project/RecipeTable";

const ProjectLanding = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showViewRecipe, setShowViewRecipe] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);

  const [recipeDetail, setRecipeDetail] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const openView = () => setShowViewRecipe(true);
    const openCreate = () => setShowCreateRecipe(true);

    window.addEventListener("open-view-recipe", openView);
    window.addEventListener("open-create-recipe", openCreate);

    return () => {
      window.removeEventListener("open-view-recipe", openView);
      window.removeEventListener("open-create-recipe", openCreate);
    };
  }, []);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/projects/${projectId}/overview/`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = async (recipeId) => {
    try {
      const res = await api.get(`/api/projects/${projectId}/recipes/${recipeId}/`);
      setRecipeDetail(res.data);
      setShowViewRecipe(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="project-hero-skeleton pulse" />;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="page-container fade-in">
      <div className="page-inner">
        <ProjectHeader project={project} />

        <section className="project-overview-section">
          <div className="project-overview-header">
            <h2 className="project-overview-title">Project Overview</h2>
            <p className="project-overview-subtitle">
              Recipe-driven operational structure
            </p>
          </div>

          <div className="project-overview-canvas">
            {!recipeDetail ? (
              <div className="overview-empty-state">
                Select a recipe to render
              </div>
            ) : (
              <RecipeTable recipe={recipeDetail} />
            )}
          </div>
        </section>

        <section className="project-actions-section">
          <h2 className="project-actions-title">Project Controls</h2>
          <div className="project-grid">
            {project.role === "root_admin" && <ProjectActionsRoot />}
            {project.role === "admin" && <ProjectActionsAdmin />}
            {project.role === "user" && <ProjectActionsUser />}
          </div>
        </section>
      </div>

      {showViewRecipe && (
        <ViewRecipeModal
          projectId={projectId}
          onClose={() => setShowViewRecipe(false)}
          onSelect={handleRecipeSelect}
        />
      )}

      {showCreateRecipe && (
        <CreateRecipeModal
          projectId={projectId}
          onClose={() => setShowCreateRecipe(false)}
          onCreated={() => setShowCreateRecipe(false)}
        />
      )}
    </div>
  );
};

export default ProjectLanding;