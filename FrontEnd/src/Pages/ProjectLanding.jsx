import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Utility/api";

import ProjectHeader from "../Components/ProjectHeader/ProjectHeader";
import ProjectActionsRoot from "../Components/project/ProjectActionsRoot";
import ProjectActionsAdmin from "../Components/project/ProjectActionsAdmin";
import ProjectActionsUser from "../Components/project/ProjectActionsUser";
import ProjectInfoModal from "../Components/project/ProjectInfoModal";
import ViewRecipeModal from "../Components/project/ViewRecipeModal";
import CreateRecipeModal from "../Components/project/CreateRecipeModal";
import DeleteProjectModal from "../Components/project/DeleteProjectModal";
import InviteMembersModal from "../Components/project/InviteMembersModal";
import SecuritySettingsModal from "../Components/SecuritySettingsModal";
import RecipeTable from "../Components/project/RecipeTable";
import ViewMembersModal from "../Components/project/ViewMembersModal";

const ProjectLanding = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showViewRecipe, setShowViewRecipe] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [showInviteMembers, setShowInviteMembers] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [showViewMembers, setShowViewMembers] = useState(false);

  useEffect(() => {
    const openInfo = () => setShowProjectInfo(true);
    window.addEventListener("open-project-info", openInfo);
    return () => window.removeEventListener("open-project-info", openInfo);
  }, []);

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
      const res = await api.get(`/api/recipes/recipes/${recipeId}/`);
      setRecipeDetail(res.data);
      setShowViewRecipe(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = () => {
    setShowDeleteProject(true);
  };

  const handleProjectDeleted = () => {
    navigate("/");
  };

  const handleInviteMembers = () => {
    setShowInviteMembers(true);
  };

  const handleInvitationSent = () => {
  };

  if (loading) return <div className="project-hero-skeleton pulse" />;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="page-container">
      <div className="page-inner fade-in">
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
            {project.role === "root_admin" && (
              <ProjectActionsRoot 
                onDeleteClick={handleDeleteProject}
                onInviteClick={handleInviteMembers}
                onSecurityClick={() => setShowSecuritySettings(true)}
              />
            )}
            {project.role === "admin" && (<ProjectActionsAdmin onManageMembers={() => setShowViewMembers(true)} />)}
            {project.role === "user" && <ProjectActionsUser />}
          </div>
        </section>
      </div>

      {showViewMembers && (
        <ViewMembersModal
          project={project}
          onClose={() => setShowViewMembers(false)}
        />
      )}

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
          project={project}
          onClose={() => setShowCreateRecipe(false)}
          onCreated={() => setShowCreateRecipe(false)}
        />
      )}

      {showProjectInfo && (
        <ProjectInfoModal
          project={project}
          onClose={() => setShowProjectInfo(false)}
        />
      )}

      {showDeleteProject && project.role === "root_admin" && (
        <DeleteProjectModal
          project={project}
          onClose={() => setShowDeleteProject(false)}
          onDeleted={handleProjectDeleted}
        />
      )}

      {showInviteMembers && project.role === "root_admin" && (
        <InviteMembersModal
          project={project}
          onClose={() => setShowInviteMembers(false)}
          onInvited={handleInvitationSent}
        />
      )}

      {showSecuritySettings && project.role === "root_admin" && (
        <SecuritySettingsModal
          isOpen={showSecuritySettings}
          onClose={() => setShowSecuritySettings(false)}
          project={project}
        />
      )}
    </div>
  );
};

export default ProjectLanding;