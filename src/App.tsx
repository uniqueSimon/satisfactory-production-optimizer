import { getRecipesFromConfig } from "./getRecipesFromConfig";
import { BestRecipesOfProducts } from "./BestRecipesOfProduct";
import relevantProducts from "./relevantProducts.json";
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
import { useEffect, useState } from "react";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";
import { recipeTreeSearch } from "./recipeTreeSearch";
import { RecipeSelection } from "./RecipeSelection";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { narrowDownRecipes } from "./narrowDownRecipes";
import "./styles.css";

export interface Recipe {
  recipeName: string;
  productName: string;
  productAmount: number;
  ingredients: { name: string; amount: number }[];
  time: number;
}

const groupRecipesByProduct = (
  recipes: Recipe[],
  oldSelection: Map<string, { recipe: Recipe; selected: boolean }[]>
) => {
  const grouped = new Map<string, { recipe: Recipe; selected: boolean }[]>();
  for (const recipe of recipes) {
    const entry = grouped.get(recipe.productName);
    const oldEntry = oldSelection.get(recipe.productName);
    const selected =
      oldEntry?.find((x) => x.recipe === recipe)?.selected ?? true;
    if (entry) {
      entry.push({ recipe, selected });
    } else {
      grouped.set(recipe.productName, [{ recipe, selected }]);
    }
  }
  return grouped;
};

const allRecipes = getRecipesFromConfig();

const findRecipeByName = new Map<string, Recipe>();
for (const recipe of allRecipes) {
  findRecipeByName.set(recipe.recipeName, recipe);
}

export const App = () => {
  const [productToProduce, setProductToProduce] = useState(
    "IronPlateReinforced"
  );
  const [wantedOutputRate, setWantedOutputRate] = useState(1);
  const [excludedRecipes, setExcludedRecipes] = useState([
    "Screw", //same as Alternate_Screw, no IronRod
    "Alternate_ReinforcedIronPlate_1", //worse than IronPlateReinforced, same Ingredients
    "IngotSteel", //worse than Alternate_IngotSteel_1, same Ingredients
    //"IronPlateReinforced",
  ]);
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
  const { recipeVariants, tooManyVariants } = recipeTreeSearch(
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
                options={relevantProducts.map((x) => ({
                  key: x,
                  value: x,
                  label: x,
                }))}
                value={productToProduce}
                onChange={(x) => setProductToProduce(x)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Output rate (1/min)">
              <InputNumber
                value={wantedOutputRate}
                onChange={(x) => setWantedOutputRate(x!)}
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
                  label: x.recipeName,
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
                  label: x,
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
        <Form.Item label="Show only one variant per resource types">
          <Space>
            <Switch
              value={onlyOneVariantPerResourceTypes}
              onChange={(x) => setShowOnlyOneVariantPerResourceTypes(x)}
            />
            {tooManyVariants && (
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
