import React, { useEffect, useState } from "react";
import api from "../../Utility/api";
import { toast } from "react-toastify";

const CreateRecipeModal = ({ projectId, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCombinations, setAllCombinations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tagsRes, combosRes] = await Promise.all([
        api.get("/api/recipes/tags/"),
        api.get("/api/recipes/combinations/")
      ]);
      setTags(tagsRes.data);
      setAllCombinations(combosRes.data);
    } catch (err) {
      toast.error("Failed to fetch tags and combinations");
      console.error(err);
    }
  };

  const addCombination = () => {
    setCombinations(prev => [
      ...prev,
      {
        id: null,
        name: `Combination ${prev.length + 1}`,
        tag_values: tags.map(t => ({
          tag_id: t.id,
          value: t.default_value ?? 0
        }))
      }
    ]);
  };

  const removeCombination = (index) => {
    setCombinations(prev => prev.filter((_, i) => i !== index));
  };

  const selectCombination = (index, comboId) => {
    const selectedCombo = allCombinations.find(c => c.id === comboId);
    if (!selectedCombo) return;

    setCombinations(prev => {
      const updated = [...prev];
      updated[index] = {
        id: selectedCombo.id,
        name: selectedCombo.name,
        tag_values: selectedCombo.tag_values.map(tv => ({
          tag_id: tv.tag.id,
          value: tv.value  // Start with combination's default values
        }))
      };
      return updated;
    });
  };

  const updateValue = (comboIndex, tagIndex, value) => {
    setCombinations(prev => {
      const updated = [...prev];
      updated[comboIndex].tag_values[tagIndex].value = parseFloat(value) || 0;
      return updated;
    });
  };

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Recipe name is required");
      return;
    }

    if (combinations.length === 0) {
      toast.error("Add at least one combination");
      return;
    }

    if (combinations.some(c => !c.id)) {
      toast.error("All combinations must be selected");
      return;
    }

    try {
      setLoading(true);
      await api.post(`/api/projects/${projectId}/recipes/create/`, {
        name,
        combinations
      });
      toast.success("Recipe created successfully!");
      onCreated();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to create recipe";
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card large">
        <h3>Create Recipe</h3>

        <div className="form-group">
          <label>Recipe Name</label>
          <input
            type="text"
            placeholder="Enter recipe name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <button 
          className="button" 
          onClick={addCombination}
          disabled={loading}
        >
          Add Combination
        </button>

        {combinations.map((combo, comboIndex) => (
          <div key={comboIndex} className="combination-container" style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div>
                <label>Select Combination</label>
                <select
                  value={combo.id || ""}
                  onChange={e => selectCombination(comboIndex, parseInt(e.target.value))}
                  disabled={loading}
                >
                  <option value="">-- Choose a combination --</option>
                  {allCombinations.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="button secondary"
                onClick={() => removeCombination(comboIndex)}
                disabled={loading}
                style={{ marginTop: "20px" }}
              >
                Remove
              </button>
            </div>

            {combo.tag_values.length > 0 && (
              <table className="recipe-table" style={{ width: "100%", marginTop: "10px" }}>
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {combo.tag_values.map((tv, tagIndex) => (
                    <tr key={tv.tag_id}>
                      <td>
                        {tags.find(t => t.id === tv.tag_id)?.name || "Unknown"}
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={tv.value}
                          onChange={e => updateValue(comboIndex, tagIndex, e.target.value)}
                          disabled={loading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

        <div className="modal-actions" style={{ marginTop: "20px" }}>
          <button 
            className="button secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="button" 
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Save Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipeModal;