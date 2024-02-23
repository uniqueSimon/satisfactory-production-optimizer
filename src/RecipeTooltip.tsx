import { Tooltip } from "antd";
import { Recipe } from "./App";

export const RecipeTooltip = (props: { recipe: Recipe }) => {
  const ingredientString = props.recipe.ingredients
    .map(
      (x) =>
        `${Math.floor((x.amount / props.recipe.productAmount) * 100) / 100} ${
          x.name
        }`
    )
    .join(" + ");
  return (
    <Tooltip
      overlayStyle={{
        whiteSpace: "nowrap",
        maxWidth: "none",
      }}
      title={`${ingredientString} -> ${props.recipe.productName}`}
    >
      {props.recipe.recipeName}
    </Tooltip>
  );
};
