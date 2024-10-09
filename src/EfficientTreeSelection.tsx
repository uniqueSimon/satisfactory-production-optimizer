import { useState } from "react";
import { Tree, findRecipeByName } from "./App";
import { Select, Tooltip } from "antd";
import { productDisplayNameMapping } from "./getProductDisplayNames";
import { ContainerOverlay } from "./ContainerOverlay";

export const EfficientTreeSelection = (props: {
  tree: Tree[];
  removeResource: (resource: string) => void;
  addInputProduct: (product: string) => void;
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState(0);
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
        onChange={setSelectedRecipe}
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
              <ContainerOverlay
                icon={isLeaf ? "CLOSE" : "ADD"}
                onClick={() =>
                  isLeaf
                    ? props.removeResource(ingredientTree.product)
                    : props.addInputProduct(ingredientTree.product)
                }
              >
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
              </ContainerOverlay>
              {!isLeaf && (
                <EfficientTreeSelection
                  key={ingredientTree.product}
                  tree={ingredientTree.ingredientTree}
                  removeResource={props.removeResource}
                  addInputProduct={props.addInputProduct}
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
