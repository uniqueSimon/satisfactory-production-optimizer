import { Select, Tooltip } from "antd";
import { useState } from "react";
import { Tree, findRecipeByName } from "./App";
import { productDisplayNameMapping } from "./getProductDisplayNames";

interface Props {
  tree: Tree[];
}
export const TreeBuilder = (props: Props) => {
  const weightedPoints = props.tree.map((x) =>
    x.ingredients.reduce(
      (acc, ingredient) => acc + ingredient.weightedPoints,
      0
    )
  );
  const minWeightedPoints = weightedPoints.reduce(
    (acc, x, i) => (x < acc.value ? { index: i, value: x } : acc),
    { index: -1, value: Infinity }
  );
  const [selectedRecipe, setSelectedRecipe] = useState(minWeightedPoints.index);
  if (props.tree.length === 0) {
    return null;
  }
  return (
    <div style={{ border: "solid", textAlign: "center" }}>
      <Select
        options={props.tree.map((x, i) => ({
          key: i,
          value: i,
          label: (
            <>
              <RoundedNumber number={props.tree[i].numberOfMachines} />
              {" x "}
              <b>
                {findRecipeByName.get(x.recipeName)!.displayName}
                {props.tree.length > 1 && "*"}
              </b>
              {" WP: "}
              {Math.round(weightedPoints[i] * 100) / 100}
            </>
          ),
        }))}
        value={selectedRecipe}
        onChange={setSelectedRecipe}
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {props.tree[selectedRecipe]?.ingredients?.map((ingredientTree, i) => (
          <div
            key={i}
            style={{
              width: "100%",
              border: ingredientTree.rate < 0 ? "solid red" : undefined,
            }}
          >
            <b>{productDisplayNameMapping.get(ingredientTree.product)}</b>
            {" ("}
            <RoundedNumber number={ingredientTree.rate} />
            {" 1/min)"}
            {" WP: "}
            {Math.round(ingredientTree.weightedPoints * 100) / 100}
            <TreeBuilder
              key={ingredientTree.product}
              tree={ingredientTree.ingredientTree}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const RoundedNumber = (props: { number: number }) => {
  const rounded = Math.round(props.number * 100) / 100;
  return (
    <Tooltip title={rounded === props.number ? "" : props.number}>
      {rounded}
    </Tooltip>
  );
};
