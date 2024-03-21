import { Select, Tooltip } from "antd";
import { useState } from "react";
import { Tree, findRecipeByName } from "./App";
import { productDisplayNameMapping } from "./getProductDisplayNames";

interface Props {
  tree: Tree[];
}
export const TreeBuilder = (props: Props) => {
  const [selectedRecipe, setSelectedRecipe] = useState(0);
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
              {findRecipeByName.get(x.recipeName)!.displayName}
            </>
          ),
        }))}
        value={selectedRecipe}
        onChange={setSelectedRecipe}
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {props.tree[selectedRecipe]?.ingredients?.map((ingredientTree, i) => (
          <div key={i} style={{ width: "100%" }}>
            {productDisplayNameMapping.get(ingredientTree.product)}
            {" ("}
            <RoundedNumber number={ingredientTree.rate} />
            {" 1/min)"}
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
