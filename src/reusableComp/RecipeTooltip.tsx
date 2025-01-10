import { Tooltip } from "antd";
import { Recipe } from "../App";
import { IconWithTooltip } from "./IconWithTooltip";

export const RecipeTooltip = (props: { recipe: Recipe; rate: number }) => {
  if (!props.recipe) {
    return "";
  }
  const ingredients = props.recipe.ingredients;
  return (
    <Tooltip
      overlayStyle={{
        whiteSpace: "nowrap",
        maxWidth: "none",
      }}
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          {ingredients.map((ingredient, i) => {
            const ingredientRate =
              (props.rate * ingredient.amount) / props.recipe.product.amount;
            const notLastIngredient = i < ingredients.length - 1;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {`${ingredientRate}/min`}
                <IconWithTooltip item={ingredient.name} />
                {notLastIngredient && <div style={{ margin: 5 }}>+</div>}
              </div>
            );
          })}
          {`--------->     ${props.rate}/min`}
          <IconWithTooltip item={props.recipe.product.name} />
        </div>
      }
    >
      {props.recipe.displayName}
    </Tooltip>
  );
};
