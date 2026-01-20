import React from "react";

const RecipeTable = ({ recipe }) => {
  const tags = recipe.combinations[0]?.tags.map(t => t.tag.name) ?? [];

  return (
    <table className="recipe-table">
      <thead>
        <tr>
          <th>Combination</th>
          {tags.map(t => (
            <th key={t}>{t}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {recipe.combinations.map(c => (
          <tr key={c.id}>
            <td>{c.name}</td>
            {c.tags.map(tv => (
              <td key={tv.tag.id}>{tv.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecipeTable;