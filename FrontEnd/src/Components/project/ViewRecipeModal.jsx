import React, { useEffect, useState } from "react";
import api from "../../Utility/api";

const ViewRecipeModal = ({ projectId, onClose, onSelect }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const res = await api.get(`/api/recipes/projects/${projectId}/recipes/`);
    setRecipes(res.data);
    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Available Recipes</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="recipe-list">
            {recipes.map((r) => (
              <li
                key={r.id}
                className="recipe-item"
                onClick={() => onSelect(r.id)}
              >
                {r.name}
              </li>
            ))}
          </ul>
        )}

        <button className="button secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewRecipeModal;