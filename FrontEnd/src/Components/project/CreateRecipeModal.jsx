import React, { useEffect, useState } from "react";
import api from "../../Utility/api";
import { toast } from "react-toastify";
import ModalPortal from "../common/ModalPortal";

const CreateRecipeModal = ({ projectId, project, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCombinations, setAllCombinations] = useState([]);
  const [loadingCombinations, setLoadingCombinations] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState(new Set());

  useEffect(() => {
    fetchData();
    window.dispatchEvent(new CustomEvent("close-sidebar-dropdown"));
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoadingCombinations(true);
      const [tagsRes, combosRes] = await Promise.all([
        api.get("/api/recipes/tags/"),
        api.get("/api/recipes/combinations/")
      ]);
      setTags(tagsRes.data);
      setAllCombinations(combosRes.data);
    } catch (err) {
      toast.error("Failed to fetch tags and combinations");
      console.error(err);
    } finally {
      setLoadingCombinations(false);
    }
  };

  const addCombination = () => {
    if (allCombinations.length === 0) {
      toast.error("No combinations available");
      return;
    }
    const newIndex = combinations.length;
    setCombinations(prev => [
      ...prev,
      {
        id: null,
        name: "",
        tag_values: []
      }
    ]);
    setExpandedIndices(prev => new Set([...prev, newIndex]));
  };

  const removeCombination = (index) => {
    setCombinations(prev => prev.filter((_, i) => i !== index));
    setExpandedIndices(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const toggleExpanded = (index) => {
    setExpandedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectCombination = (index, comboId) => {
    const selectedCombo = allCombinations.find(c => c.id === comboId);
    if (!selectedCombo) {
      toast.error("Combination not found");
      return;
    }

    setCombinations(prev => {
      const updated = [...prev];
      updated[index] = {
        id: selectedCombo.id,
        name: selectedCombo.name,
        tag_values: selectedCombo.tag_values.map(tv => ({
          tag_id: tv.tag.id,
          value: tv.value
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

  await createRecipe();
};

const createRecipe = async () => {
  try {
    setLoading(true);

    await api.post(
      `/api/recipes/projects/${projectId}/recipes/create/`,
      { name, combinations }
    );

    toast.success("Recipe created successfully!");
    onCreated();
    onClose();
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail || "Failed to create recipe";
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <ModalPortal>
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
            disabled={loading || loadingCombinations}
          />
        </div>

        <div className="form-group">
          <label>Add Combinations to Recipe</label>
          <p style={{ fontSize: "12px", color: "var(--text-secondary, #999)", marginBottom: "10px" }}>
            {loadingCombinations 
              ? "Loading combinations..." 
              : `${allCombinations.length} combinations available`}
          </p>
          
          <button 
            className="button" 
            onClick={addCombination}
            disabled={loading || loadingCombinations || allCombinations.length === 0}
          >
            + Add Combination
          </button>
        </div>

        {combinations.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h4>Selected Combinations ({combinations.length})</h4>
            {combinations.map((combo, comboIndex) => {
              const isExpanded = expandedIndices.has(comboIndex);
              return (
                <div 
                  key={comboIndex} 
                  className="combination-container" 
                  style={{ 
                    marginTop: "15px", 
                    padding: "15px", 
                    border: "1px solid var(--border-color, #444)", 
                    borderRadius: "8px",
                    backgroundColor: "var(--input-bg, #1a1a1a)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isExpanded ? "15px" : "0px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", color: "var(--text-color)" }}>
                        <strong>Step {comboIndex + 1}: {combo.name || "Select Combination"}</strong>
                      </label>
                      {isExpanded && (
                        <select
                          value={combo.id || ""}
                          onChange={e => selectCombination(comboIndex, parseInt(e.target.value))}
                          disabled={loading}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border-color, #555)",
                            backgroundColor: "var(--input-bg, #2a2a2a)",
                            color: "var(--text-color)"
                          }}
                        >
                          <option value="">-- Choose a combination --</option>
                          {allCombinations.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginLeft: "10px" }}>
                      <button
                        className="button secondary"
                        onClick={() => toggleExpanded(comboIndex)}
                        disabled={loading}
                        style={{ minWidth: "40px", padding: "8px" }}
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? "▼" : "▶"}
                      </button>
                      <button
                        className="button secondary"
                        onClick={() => removeCombination(comboIndex)}
                        disabled={loading}
                        style={{ minWidth: "40px", padding: "8px" }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {isExpanded && combo.id && combo.tag_values.length > 0 && (
                    <div>
                      <label style={{ display: "block", marginBottom: "10px", marginTop: "15px", color: "var(--text-color)" }}>
                        <strong>Tag Values for {combo.name}</strong>
                      </label>
                      <table className="recipe-table" style={{ width: "100%", fontSize: "12px" }}>
                        <thead>
                          <tr>
                            <th>Tag</th>
                            <th style={{ width: "100px" }}>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {combo.tag_values.map((tv, tagIndex) => (
                            <tr key={tv.tag_id}>
                              <td>
                                {tags.find(t => t.id === tv.tag_id)?.name || `Tag ${tv.tag_id}`}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={tv.value}
                                  onChange={e => updateValue(comboIndex, tagIndex, e.target.value)}
                                  disabled={loading}
                                  style={{
                                    width: "100%",
                                    padding: "4px",
                                    borderRadius: "4px",
                                    border: "1px solid var(--border-color, #555)",
                                    backgroundColor: "var(--input-bg, #333)",
                                    color: "var(--text-color)"
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {isExpanded && !combo.id && (
                    <p style={{ color: "var(--text-secondary, #999)", fontSize: "12px", fontStyle: "italic", marginTop: "10px" }}>
                      Select a combination to see its tags
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
            disabled={loading || loadingCombinations}
          >
            {loading ? "Creating..." : "Save Recipe"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default CreateRecipeModal;