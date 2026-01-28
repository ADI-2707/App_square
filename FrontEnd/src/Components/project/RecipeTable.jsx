import React from "react";

const RecipeTable = ({ recipe }) => {
  if (!recipe?.recipe_combinations?.length) {
    return <div className="overview-empty-state">No recipe data</div>;
  }

  const combinations = recipe.recipe_combinations;

  const maxRows = Math.max(
    ...combinations.map(
      c => c.custom_tag_values?.length || 0
    )
  );

  return (
    <div className="recipe-table-wrapper">
      <h3 className="recipe-title">{recipe.name}</h3>

      <table className="recipe-table">
        <thead>
          <tr>
            {combinations.map(c => (
              <th key={c.id} colSpan={2}>
                {c.combination.name}
              </th>
            ))}
          </tr>

          <tr>
            {combinations.map(c => (
              <React.Fragment key={c.id}>
                <th>Tag</th>
                <th>Value</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: maxRows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {combinations.map(c => {
                const tagObj = c.custom_tag_values[rowIndex];

                return (
                  <React.Fragment key={c.id}>
                    <td>{tagObj ? tagObj.tag.name : "–"}</td>
                    <td>{tagObj ? tagObj.value : "–"}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecipeTable;