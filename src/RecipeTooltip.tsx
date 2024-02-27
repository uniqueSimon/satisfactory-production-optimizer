import { Tooltip } from "antd";
import { Recipe } from "./App";
import { productDisplayNameMapping } from "./getProductDisplayNames";

export const RecipeTooltip = (props: { recipe: Recipe }) => {
  const ingredientString = props.recipe.ingredients
    .map(
      (x) =>
        `${
          Math.floor((x.amount / props.recipe.productAmount) * 100) / 100
        } ${productDisplayNameMapping.get(x.name)}`
    )
    .join(" + ");
  return (
    <Tooltip
      overlayStyle={{
        whiteSpace: "nowrap",
        maxWidth: "none",
      }}
      title={`${ingredientString} -> ${productDisplayNameMapping.get(
        props.recipe.productName
      )}, ${props.recipe.recipeName}`}
    >
      {props.recipe.displayName}
    </Tooltip>
  );
};
