import { Tree, findRecipeByName } from "./App";
import { Tooltip } from "antd";
import { productDisplayNameMapping } from "./getProductDisplayNames";

export const EfficientTreeSelection = (props: { tree: Tree | null }) => {
  if (!props.tree) {
    return null;
  }
  return (
    <div>
      <div
        style={{
          width: "100%",
          border: "solid",
          textAlign: "center",
          margin: -1,
          padding: 3,
        }}
      >
        <RoundedNumber number={props.tree.numberOfMachines} />
        {" x "}
        <b>{findRecipeByName.get(props.tree.recipeName)!.displayName}</b>
      </div>
      <div style={{ display: "flex" }}>
        {props.tree.ingredients?.map((ingredientTree, i) => {
          const isLeaf = !ingredientTree.ingredientTree;
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
