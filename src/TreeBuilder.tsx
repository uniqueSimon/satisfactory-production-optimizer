import { Button, Form, InputNumber } from "antd";
import { Recipe, Tree } from "./App";
import { buildTree } from "./buildTree";
import { SelectOutlined } from "@ant-design/icons";
import { EfficientTreeSelection } from "./EfficientTreeSelection";
import { TreeLayout } from "./TreeLayout";
import { useState } from "react";

interface Props {
  productToProduce: string;
  wantedOutputRate: number;
  currentRecipes: Recipe[];
  currentProducts: string[];
  allRelevantRecipes: Recipe[];
  addInputProduct: (product: string) => void;
}

export const TreeBuilder = (props: Props) => {
  const tree = buildTree(
    props.productToProduce,
    props.wantedOutputRate,
    props.currentRecipes,
    props.currentProducts,
    props.allRelevantRecipes
  );
  const [scale, setScale] = useState(3);
  return (
    <>
      {/* <LinkToCalculator
        productToProduce={props.productToProduce}
        wantedOutputRate={props.wantedOutputRate}
        currentProducts={props.currentProducts}
        tree={tree}
      /> */}
      <div style={{ display: "flex" }}>
        <EfficientTreeSelection key={JSON.stringify(tree)} tree={tree} />
      </div>
      <div style={{ height: 50 }}></div>
      <Form.Item label="Scaling factor" style={{ width: 250 }}>
        <InputNumber value={scale} onChange={(x) => setScale(x ?? 1)} />
      </Form.Item>
      <div style={{ display: "flex" }}>
        <TreeLayout tree={tree} scale={scale} />
      </div>
    </>
  );
};

/* const LinkToCalculator = (props: {
  productToProduce: string;
  wantedOutputRate: number;
  tree: Tree[];
  currentProducts: string[];
}) => {
  const baseLink =
    "https://satisfactory-calculator.com/en/planners/production/index/json/";
  const input = props.currentProducts.length
    ? Object.fromEntries(
        props.currentProducts.map((x) => [`Desc_${x}_C`, 1_000_000])
      )
    : undefined;
  const bestRecipes: string[] = [];
  const recursion = (tree: Tree[]) => {
    for (const recipeTree of tree) {
      if (recipeTree.isBestRecipe) {
        bestRecipes.push(recipeTree.recipeName);
        for (const ingredient of recipeTree.ingredients) {
          recursion(ingredient.ingredientTree);
        }
      }
    }
  };
  recursion(props.tree);
  const altRecipes = bestRecipes.map((x) => `Recipe_${x}_C`);
  const obj = {
    [`Desc_${props.productToProduce}_C`]: props.wantedOutputRate.toString(),
    input,
    altRecipes,
  };
  const url = `${baseLink}${encodeURIComponent(JSON.stringify(obj))}`;
  return (
    <Form.Item label="Open most efficient production plan in satisfactory-calculator.com">
      <Button onClick={() => window.open(url, "_blank")}>
        Link
        <SelectOutlined rotate={90} />
      </Button>
    </Form.Item>
  );
}; */
