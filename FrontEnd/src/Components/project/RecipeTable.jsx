import React from "react";

const RecipeTable = ({ recipe }) => {
  const tags = new Set();

  recipe.recipe_combinations.forEach((rc) => {
    rc.combination.tag_values.forEach((tv) => {
      tags.add(tv.tag.name);
    });
  });

  const tagList = Array.from(tags);

  return (
    <table className="recipe-table">
      <thead>
        <tr>
          <th>Combination</th>
          {tagList.map((tag) => (
            <th key={tag}>{tag}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {recipe.recipe_combinations.map((rc) => (
          <tr key={rc.combination.id}>
            <td>{rc.combination.name}</td>
            {tagList.map((tag) => {
              const tv = rc.combination.tag_values.find(
                (t) => t.tag.name === tag
              );
              return <td key={tag}>{tv ? tv.value : "-"}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecipeTable;