import { Tooltip } from "antd";
import { Tree, findRecipeByName } from "./App";

const machineSizes = new Map([
  ["SMELTER", { size: [6, 9], color: "grey" }],
  ["CONSTRUCTOR", { size: [8, 10], color: "blue" }],
  ["ASSEMBLER", { size: [10, 15], color: "green" }],
  ["REFINERY", { size: [10, 20], color: "yellow" }],
  ["FOUNDRY", { size: [10, 9], color: "purple" }],
  ["MANUFACTURER", { size: [18, 19], color: "orange" }],
]);

export const TreeLayout = (props: { tree: Tree | null; scale: number }) => {
  if (!props.tree) {
    return null;
  }
  const bestBranch = props.tree;
  const recipe = findRecipeByName.get(bestBranch.recipeName)!;
  const ceil = Math.ceil(bestBranch.numberOfMachines);
  return (
    <div>
      <div
        style={{ border: "solid", textAlign: "center", padding: 3, margin: -1 }}
      >
        <RoundedNumber number={bestBranch.numberOfMachines} />
        {Number.isInteger(bestBranch.numberOfMachines) ||
        bestBranch.numberOfMachines < 1 ? null : (
          <>
            {" ( = "}
            <RoundedNumber number={ceil} />
            {" x "}{" "}
            <RoundedNumber number={bestBranch.numberOfMachines / ceil} />
            {" ) "}
          </>
        )}
        {" x "}
        <b>
          {recipe.displayName} {recipe.producedIn}
        </b>
      </div>
      <div style={{ display: "flex" }}>
        {[...Array(ceil)].map((_, i) => (
          <div
            key={i}
            style={{
              border: "solid",
              margin: -1,
              backgroundColor: machineSizes.get(recipe.producedIn)?.color,
              width:
                props.scale *
                (machineSizes.get(recipe.producedIn)?.size[0] ?? 10),
              height:
                props.scale *
                (machineSizes.get(recipe.producedIn)?.size[1] ?? 20),
            }}
          ></div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        {bestBranch?.ingredients?.map((ingredientTree, i) => (
          <div
            key={i}
            style={{
              border: ingredientTree.rate < 0 ? "solid red" : undefined,
            }}
          >
            <TreeLayout
              key={ingredientTree.product}
              tree={ingredientTree.ingredientTree}
              scale={props.scale}
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
