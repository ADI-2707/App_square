import React, { useEffect, useState } from "react";
import api from "../../Utility/api";

const CreateRecipeModal = ({ projectId, onClose, onCreated }) => {
  const [recipeName, setRecipeName] = useState("");
  const [tags, setTags] = useState([]);
  const [combinations, setCombinations] = useState([]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const res = await api.get(`/api/tags/`);
    setTags(res.data);
  };

  const addCombination = () => {
    setCombinations([
      ...combinations,
      {
        name: `C${combinations.length + 1}`,
        tags: tags.map(t => ({
          tag_id: t.id,
          value: t.default_value
        }))
      }
    ]);
  };

  const updateValue = (cIndex, tIndex, value) => {
    const updated = [...combinations];
    updated[cIndex].tags[tIndex].value = value;
    setCombinations(updated);
  };

  const submitRecipe = async () => {
    await api.post(
      `/api/projects/${projectId}/recipes/create/`,
      {
        name: recipeName,
        combinations
      }
    );

    window.dispatchEvent(new Event("recipes-updated"));
    onCreated();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card large">
        <h3>Create Recipe</h3>

        <input
          placeholder="Recipe Name (R1, R2...)"
          value={recipeName}
          onChange={e => setRecipeName(e.target.value)}
        />

        <button className="button" onClick={addCombination}>
          Add Combination
        </button>

        {combinations.map((combo, cIndex) => (
          <div key={cIndex} className="combo-builder">
            <h4>{combo.name}</h4>

            <table className="recipe-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {combo.tags.map((t, tIndex) => (
                  <tr key={t.tag_id}>
                    <td>{tags.find(x => x.id === t.tag_id)?.name}</td>
                    <td>
                      <input
                        type="number"
                        value={t.value}
                        onChange={e =>
                          updateValue(cIndex, tIndex, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" onClick={submitRecipe}>
            Save Recipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipeModal;