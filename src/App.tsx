import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { BestRecipesOfProducts } from "./BestRecipesOfProduct";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";
import { recipeTreeSearch } from "./recipeTreeSearch";
import { RecipeSelection } from "./RecipeSelection";
import { narrowDownRecipes } from "./narrowDownRecipes";
import { productDisplayNameMapping } from "./getProductDisplayNames";
import { allRecipes } from "./allRecipesFromConfig";
import "./styles.css";
import { TreeBuilder } from "./TreeBuilder";
import { buildTree } from "./buildTree";

export interface Recipe {
  recipeName: string;
  displayName: string;
  products: { name: string; amount: number }[];
  ingredients: { name: string; amount: number }[];
  time: number;
}
export interface Tree {
  recipeName: string;
  numberOfMachines: number;
  ingredients: {
    product: string;
    rate: number;
    weightedPoints: number;
    ingredientTree: Tree[];
  }[];
}
const defaultExcludedRecipes = [
  "Screw", //same as Alternate_Screw, no IronRod
  "Alternate_ReinforcedIronPlate_1", //worse than IronPlateReinforced, same Ingredients
  "IngotSteel", //worse than Alternate_IngotSteel_1, same Ingredients
  //"IronPlateReinforced",
  "Alternate_Coal_1", //requires wood
  "Alternate_Coal_2", //requires biomass
  "Alternate_Plastic_1", //to avoid loop
  "Alternate_RecycledRubber", //to avoid loop
  "Plastic",
  "Rubber",
  "ResidualPlastic",
  "ResidualRubber",
  "LiquidFuel",
  "Alternate_PolymerResin",
  //"Alternate_HeavyOilResidue",
];

const groupRecipesByProduct = (
  recipes: Recipe[],
  oldSelection: Map<string, { recipe: Recipe; selected: boolean }[]>
) => {
  const grouped = new Map<string, { recipe: Recipe; selected: boolean }[]>();
  for (const recipe of recipes) {
    const productName = recipe.products[0].name;
    const entry = grouped.get(productName);
    const oldEntry = oldSelection.get(productName);
    const selected =
      oldEntry?.find((x) => x.recipe === recipe)?.selected ?? true;
    if (entry) {
      entry.push({ recipe, selected });
    } else {
      grouped.set(productName, [{ recipe, selected }]);
    }
  }
  return grouped;
};

export const findRecipeByName = new Map<string, Recipe>();
for (const recipe of allRecipes) {
  findRecipeByName.set(recipe.recipeName, recipe);
}

const allProducts = new Set<string>();
for (const recipe of allRecipes) {
  allProducts.add(recipe.products[0].name);
}

export const App = () => {
  const [productToProduce, setProductToProduce] = useState(
    "IronPlateReinforced"
  );
  const [wantedOutputRate, setWantedOutputRate] = useState(1);
  const [excludedRecipes, setExcludedRecipes] = useState(
    defaultExcludedRecipes
  );
  const [
    onlyOneVariantPerResourceTypes,
    setShowOnlyOneVariantPerResourceTypes,
  ] = useState(true);
  const [allRelevantRecipes, setAllRelevantRecipes] = useState<Recipe[]>([]);
  const [groupedRecipes, setGroupedRecipes] = useState(
    new Map<string, { recipe: Recipe; selected: boolean }[]>()
  );
  const [resourcesToChooseFrom, setResourcesToChooseFrom] = useState<string[]>(
    []
  );
  const [productsToChooseFrom, setProductsToChooseFrom] = useState<string[]>(
    []
  );
  const [currentResources, setCurrentResources] = useState<string[]>([]);
  useEffect(() => {
    const { usedProducts, usedRecipes, usedResources } =
      findAllRelatedRecipesAndProducts(
        productToProduce,
        allRecipes.filter((x) => !excludedRecipes.includes(x.recipeName))
      );
    setResourcesToChooseFrom(usedResources);
    setProductsToChooseFrom(usedProducts);
    setCurrentResources(usedResources);
    setGroupedRecipes((old) => groupRecipesByProduct(usedRecipes, old));
    setAllRelevantRecipes(usedRecipes);
  }, [productToProduce, excludedRecipes]);
  const currentRecipes = Array.from(groupedRecipes.values())
    .flat()
    .filter((x) => x.selected)
    .map((x) => x.recipe);
  const recipeVariants = recipeTreeSearch(
    productToProduce,
    currentResources,
    currentRecipes,
    onlyOneVariantPerResourceTypes,
    wantedOutputRate
  );
  const updateResourcesAndRecipes = (resources: string[]) => {
    setCurrentResources(resources);
    const narrowedDownRecipes = narrowDownRecipes(
      productToProduce,
      allRelevantRecipes,
      resources
    );
    setGroupedRecipes((old) => groupRecipesByProduct(narrowedDownRecipes, old));
  };
  const tree = buildTree(productToProduce, wantedOutputRate, currentRecipes);
  console.log(tree);
  return (
    <div className="page-container">
      <Typography.Title>Satisfactory Production Optimizer</Typography.Title>
      <Form>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Product"
              tooltip={{ title: "Select a product to produce" }}
            >
              <Select
                showSearch={true}
                options={[...allProducts].map((x) => ({
                  key: x,
                  value: x,
                  label: productDisplayNameMapping.get(x)!,
                }))}
                value={productToProduce}
                onChange={setProductToProduce}
                filterOption={(input, option) =>
                  option!.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Output rate (1/min)">
              <InputNumber
                value={wantedOutputRate}
                onChange={(x) => setWantedOutputRate(x ?? 0)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Recipes to exclude">
              <Select
                mode="multiple"
                allowClear={true}
                options={allRecipes.map((x) => ({
                  key: x.recipeName,
                  value: x.recipeName,
                  label: x.displayName,
                }))}
                value={excludedRecipes}
                onChange={(x) => setExcludedRecipes(x)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Input resources">
          <Row gutter={16}>
            <Col span={2}>
              <Button
                onClick={() => updateResourcesAndRecipes(resourcesToChooseFrom)}
              >
                Select all
              </Button>
            </Col>
            <Col span={22}>
              <Select
                mode="multiple"
                allowClear={true}
                options={[
                  ...resourcesToChooseFrom,
                  ...productsToChooseFrom,
                ].map((x) => ({
                  key: x,
                  value: x,
                  label: productDisplayNameMapping.get(x),
                }))}
                value={currentResources}
                onChange={updateResourcesAndRecipes}
              />
            </Col>
          </Row>
        </Form.Item>
        <RecipeSelection
          groupedRecipes={groupedRecipes}
          setGroupedRecipes={setGroupedRecipes}
          findRecipeByName={findRecipeByName}
          inputProducts={currentResources}
          currentRecipes={currentRecipes}
        />
        <TreeBuilder
          key={JSON.stringify(tree.recipeTree)}
          tree={tree.recipeTree}
        />
        <Form.Item label="Show only one variant per resource types">
          <Space>
            <Switch
              value={onlyOneVariantPerResourceTypes}
              onChange={(x) => setShowOnlyOneVariantPerResourceTypes(x)}
            />
            {recipeVariants.length >= 100 && (
              <Tooltip title="There are too many variants! Not all variants could be calculated!">
                <ExclamationCircleOutlined
                  style={{ fontSize: "30px", color: "red" }}
                />
              </Tooltip>
            )}
          </Space>
        </Form.Item>
      </Form>
      <BestRecipesOfProducts
        productToProduce={productToProduce}
        wantedOutputRate={wantedOutputRate}
        recipeVariants={recipeVariants ?? []}
        findRecipeByName={findRecipeByName}
        currentResourceTypes={currentResources}
        chooseResourceTypes={(resourceTypes) => {
          updateResourcesAndRecipes([...resourceTypes]);
          setShowOnlyOneVariantPerResourceTypes(false);
        }}
      />
    </div>
  );
};
