import { Tooltip } from "antd";
import { Recipe } from "../App";
import { productDisplayNameMapping } from "../parseGameData/getProductDisplayNames";

export const RecipeTooltip = (props: { recipe: Recipe }) => {
  if (!props.recipe) {
    return "";
  }
  const ingredientString = props.recipe.ingredients
    .map((x) => makeProductAmountString(x))
    .join(" + ");
  const productsString = makeProductAmountString(props.recipe.product);
  return (
    <Tooltip
      overlayStyle={{
        whiteSpace: "nowrap",
        maxWidth: "none",
      }}
      title={`${ingredientString} -> ${productsString} (${props.recipe.time}s)`}
    >
      {props.recipe.displayName}
    </Tooltip>
  );
};

const makeProductAmountString = (product: { name: string; amount: number }) =>
  `${product.amount} ${productDisplayNameMapping.get(product.name)}`;
