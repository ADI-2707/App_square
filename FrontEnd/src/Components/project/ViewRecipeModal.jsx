import React, { useEffect, useState } from "react";
import api from "../../Utility/api";
import ModalPortal from "../../Utility/ModalPortal";

const ViewRecipeModal = ({ projectId, onClose, onSelect }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const res = await api.get(
      `/api/recipes/projects/${projectId}/recipes/`
    );
    setRecipes(res.data);
    setLoading(false);
  };

  return (
    <ModalPortal>
      <div className="modal-backdrop">
        <div className="modal-card">
          <h3 className="modal-title">Available Recipes</h3>

          <div className="recipe-list-wrapper">
            {loading ? (
              <p className="modal-muted">Loading recipes…</p>
            ) : recipes.length === 0 ? (
              <p className="modal-muted">No recipes available</p>
            ) : (
              <ul className="recipe-list">
                {recipes.map((r) => (
                  <li
                    key={r.id}
                    className="recipe-item"
                    onClick={() => onSelect(r.id)}
                  >
                    <span className="recipe-name">{r.name}</span>
                    <span className="recipe-chevron">›</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-actions">
            <button className="button secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ViewRecipeModal;