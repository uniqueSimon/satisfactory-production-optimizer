import { Tooltip } from "antd";
import { Recipe } from "./App";
import { productDisplayNameMapping } from "./getProductDisplayNames";

export const RecipeTooltip = (props: { recipe: Recipe }) => {
  const ingredientString = props.recipe.ingredients
    .map((x) => makeProductAmountString(x))
    .join(" + ");
  const productsString = props.recipe.products
    .map((product) => makeProductAmountString(product))
    .join(" + ");
  return (
    <Tooltip
      overlayStyle={{
        whiteSpace: "nowrap",
        maxWidth: "none",
      }}
      title={`${ingredientString} -> ${productsString}`}
    >
      {props.recipe.displayName}
    </Tooltip>
  );
};

const makeProductAmountString = (product: { name: string; amount: number }) =>
  `${product.amount} ${productDisplayNameMapping.get(product.name)}`;
