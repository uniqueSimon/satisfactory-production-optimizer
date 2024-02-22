import { getRecipesFromConfig } from "./getRecipesFromConfig";
import { BestRecipesOfProducts } from "./BestRecipesOfProduct";
import { createIngredientFinder } from "./createIngredientFinder";
import relevantProducts from "./relevantProducts.json";
import {
  Button,
  Form,
  InputNumber,
  Select,
  Space,
  Switch,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";
import { recipeTreeSearch } from "./recipeTreeSearch";
import { RecipeSelection } from "./RecipeSelection";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export interface Recipe {
  recipeName: string;
  productName: string;
  productAmount: number;
  ingredients: { name: string; amount: number }[];
  time: number;
}

const groupRecipesByProduct = (recipes: Recipe[]) => {
  const grouped = new Map<string, { recipe: Recipe; selected: boolean }[]>();
  for (const recipe of recipes) {
    const entry = grouped.get(recipe.productName);
    if (entry) {
      entry.push({ recipe, selected: true });
    } else {
      grouped.set(recipe.productName, [{ recipe, selected: true }]);
    }
  }
  return grouped;
};

const allRecipes = getRecipesFromConfig();
const ingredientFinder = createIngredientFinder(allRecipes);

export const App = () => {
  const [productToProduce, setProductToProduce] = useState(
    "IronPlateReinforced"
  );
  const [wantedOutputRate, setWantedOutputRate] = useState(1);
  const [
    onlyOneVariantPerResourceTypes,
    setShowOnlyOneVariantPerResourceTypes,
  ] = useState(true);
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
      findAllRelatedRecipesAndProducts(productToProduce, allRecipes);
    setResourcesToChooseFrom(usedResources);
    setProductsToChooseFrom(usedProducts);
    setCurrentResources(usedResources);
    const groupedRecipesByProduct = groupRecipesByProduct(usedRecipes);
    setGroupedRecipes(groupedRecipesByProduct);
  }, [productToProduce]);
  const currentRecipes = Array.from(groupedRecipes.values())
    .flat()
    .filter((x) => x.selected)
    .map((x) => x.recipe);
  const { recipeVariants, tooManyVariants } = recipeTreeSearch(
    productToProduce,
    currentResources,
    currentRecipes,
    onlyOneVariantPerResourceTypes
  );
  return (
    <>
      <Form>
        <Form.Item label="Select a product to produce">
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
        <Form.Item label="Wanted output rate">
          <InputNumber
            value={wantedOutputRate}
            onChange={(x) => setWantedOutputRate(x!)}
          />
        </Form.Item>
        <RecipeSelection
          groupedRecipes={groupedRecipes}
          setGroupedRecipes={setGroupedRecipes}
        />
        {/* <Form.Item label="Select all wanted recipes">
          <Button onClick={() => setCurrentRecipes(recipesToChooseFrom)}>
            Select all recipes
          </Button>
          <Select
            mode="multiple"
            allowClear={true}
            options={recipesToChooseFrom.map((x) => ({
              key: x,
              value: x,
              label: x,
            }))}
            value={currentRecipes}
            onChange={(x) => setCurrentRecipes(x)}
          />
        </Form.Item> */}
        <Form.Item label="Select all wanted resources">
          <Button onClick={() => setCurrentResources(resourcesToChooseFrom)}>
            Select all resources
          </Button>
          <Select
            mode="multiple"
            allowClear={true}
            options={[...resourcesToChooseFrom, ...productsToChooseFrom].map(
              (x) => ({
                key: x,
                value: x,
                label: x,
              })
            )}
            value={currentResources}
            onChange={(x) => setCurrentResources(x)}
          />
        </Form.Item>
        <Form.Item label="Show only one variant per resource types">
          <Space>
            <Switch
              value={onlyOneVariantPerResourceTypes}
              onChange={(x) => setShowOnlyOneVariantPerResourceTypes(x)}
            />
            {tooManyVariants && (
              <Tooltip title="There are too many variants! Only one variant per resource types is shown.">
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
        recipeVariants={recipeVariants ?? []}
        ingredientFinder={ingredientFinder}
        chooseResourceTypes={(resourceTypes) => {
          setCurrentResources([...resourceTypes]);
          setShowOnlyOneVariantPerResourceTypes(false);
        }}
      />
      {/* <RecipeOverview recipeLookup={recipeLookup} />
      <pre>{JSON.stringify(allRecipes, null, 2)}</pre> */}
    </>
  );
};
