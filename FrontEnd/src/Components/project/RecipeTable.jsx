import React from "react";

const RecipeTable = ({ recipe }) => {
  if (!recipe || !recipe.recipe_combinations || recipe.recipe_combinations.length === 0) {
    return <div>No combinations in this recipe</div>;
  }

  // Get all unique tags from all combinations
  const allTags = [];
  const tagMap = new Map();

  recipe.recipe_combinations.forEach(rc => {
    if (rc.combination && rc.combination.tag_values) {
      rc.combination.tag_values.forEach(tv => {
        if (tv.tag && !tagMap.has(tv.tag.id)) {
          tagMap.set(tv.tag.id, tv.tag);
          allTags.push(tv.tag);
        }
      });
    }
  });

  return (
    <table className="recipe-table">
      <thead>
        <tr>
          <th>Combination</th>
          {allTags.map(tag => (
            <th key={tag.id}>{tag.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {recipe.recipe_combinations.map((rc, index) => (
          <tr key={index}>
            <td>
              <strong>{rc.combination.name}</strong>
              <br />
              <small>Step {rc.order + 1}</small>
            </td>
            {allTags.map(tag => {
              // First check for custom values, then fall back to combination's tag values
              let value = null;

              // Check custom tag values
              if (rc.custom_tag_values && rc.custom_tag_values.length > 0) {
                const customValue = rc.custom_tag_values.find(ctv => ctv.tag.id === tag.id);
                if (customValue) {
                  value = customValue.value;
                }
              }

              // If no custom value, use combination's tag value
              if (value === null && rc.combination.tag_values) {
                const comboValue = rc.combination.tag_values.find(tv => tv.tag.id === tag.id);
                if (comboValue) {
                  value = comboValue.value;
                }
              }

              return (
                <td key={tag.id}>
                  {value !== null ? value : "-"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecipeTable;