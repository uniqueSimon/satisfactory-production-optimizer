import { useState } from "react";
import { Tree, findRecipeByName } from "./App";
import { Select, Tooltip } from "antd";
import { productDisplayNameMapping } from "./getProductDisplayNames";

export const EfficientTreeSelection = (props: {
  tree: Tree[];
  recipeSelection: string[];
  setRecipeSelection: (recipeSelection: string[]) => void;
  addInputProduct: (product: string) => void;
}) => {
  const index = props.tree.findIndex((x) =>
    props.recipeSelection.includes(x.recipeName)
  );
  const [selectedRecipe, setSelectedRecipe] = useState(
    index === -1 ? 0 : index
  );
  const onChange = (selectedRecipe: number) => {
    setSelectedRecipe(selectedRecipe);
    const recipeName = props.tree[selectedRecipe].recipeName;
    if (!props.recipeSelection.includes(recipeName)) {
      props.setRecipeSelection([...props.recipeSelection, recipeName]);
    }
  };
  return (
    <div>
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
            </>
          ),
        }))}
        value={selectedRecipe}
        onChange={onChange}
        style={{
          width: "100%",
          border: "solid",
          textAlign: "center",
          margin: -1,
          padding: 3,
        }}
      />
      <div style={{ display: "flex" }}>
        {props.tree[selectedRecipe]?.ingredients?.map((ingredientTree, i) => {
          const isLeaf = ingredientTree.ingredientTree.length === 0;
          return (
            <div key={i}>
                <div
                  style={{
                    display: "flex",
                    border: ingredientTree.rate < 0 ? "solid red" : "solid",
                    margin: -1,
                    padding: 5,
                    whiteSpace: "nowrap",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "lightgray",
                  }}
                >
                  <b>{productDisplayNameMapping.get(ingredientTree.product)}</b>
                  {" ("}
                  <RoundedNumber number={ingredientTree.rate} />
                  {"/min)"}
                </div>
              {!isLeaf && (
                <EfficientTreeSelection
                  key={ingredientTree.product}
                  tree={ingredientTree.ingredientTree}
                  addInputProduct={props.addInputProduct}
                  recipeSelection={props.recipeSelection}
                  setRecipeSelection={props.setRecipeSelection}
                />
              )}
            </div>
          );
        })}
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
