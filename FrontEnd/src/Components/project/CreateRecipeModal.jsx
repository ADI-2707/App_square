import React, { useEffect, useState } from "react";
import api from "../../Utility/api";

const CreateRecipeModal = ({ projectId, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);
  const [combinations, setCombinations] = useState([]);

  useEffect(() => {
    api.get("/api/tags/").then(res => setTags(res.data));
  }, []);

  const addCombination = () => {
    setCombinations(prev => [
      ...prev,
      {
        name: `C${prev.length + 1}`,
        tag_values: tags.map(t => ({
          tag_id: t.id,
          value: t.default_value ?? 0
        }))
      }
    ]);
  };

  const updateValue = (c, t, value) => {
    const updated = [...combinations];
    updated[c].tag_values[t].value = value;
    setCombinations(updated);
  };

  const submit = async () => {
    await api.post(`/api/projects/${projectId}/recipes/create/`, {
      name,
      combinations
    });
    onCreated();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card large">
        <h3>Create Recipe</h3>

        <input
          placeholder="Recipe name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button className="button" onClick={addCombination}>
          Add Combination
        </button>

        {combinations.map((c, ci) => (
          <table key={ci} className="recipe-table">
            <thead>
              <tr>
                <th colSpan={2}>{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {c.tag_values.map((tv, ti) => (
                <tr key={tv.tag_id}>
                  <td>{tags.find(t => t.id === tv.tag_id)?.name}</td>
                  <td>
                    <input
                      type="number"
                      value={tv.value}
                      onChange={e => updateValue(ci, ti, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" onClick={submit}>
            Save Recipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipeModal;