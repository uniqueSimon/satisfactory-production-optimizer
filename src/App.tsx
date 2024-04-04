import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  InputNumber,
  Select,
  Typography,
} from "antd";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";
import { narrowDownRecipes } from "./narrowDownRecipes";
import { productDisplayNameMapping } from "./getProductDisplayNames";
import { ProducedIn, allRecipes } from "./allRecipesFromConfig";

import { TreeBuilder } from "./TreeBuilder";
import { useLocalStorage } from "./useLocalStorage";
import { SavedSettingsButton } from "./SavedSettingsButton";
export interface Recipe {
  recipeName: string;
  displayName: string;
  product: { name: string; amount: number };
  ingredients: { name: string; amount: number }[];
  time: number;
  producedIn: ProducedIn | "CUSTOM";
}
export interface Tree {
  recipeName: string;
  isBestRecipe: boolean;
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
  //"Plastic",
  //"Rubber",
  //"ResidualPlastic",
  //"ResidualRubber",
  //"LiquidFuel",
  //"Alternate_PolymerResin",
  //"Alternate_HeavyOilResidue",
];

export const findRecipeByName = new Map<string, Recipe>();
for (const recipe of allRecipes) {
  findRecipeByName.set(recipe.recipeName, recipe);
}

const allProducts = new Set<string>();
for (const recipe of allRecipes) {
  allProducts.add(recipe.product.name);
}

export const App = () => {
  const [savedSettings, setSavedSettings] = useLocalStorage<
    {
      timestamp: number;
      productToProduce: string;
      wantedOutputRate: number;
      currentResources: string[];
      currentProducts: string[];
    }[]
  >("saved-settings", []);
  const [productToProduce, setProductToProduce] = useLocalStorage(
    "product-to-produce",
    "IronPlateReinforced"
  );
  const [wantedOutputRate, setWantedOutputRate] = useLocalStorage(
    "wanted-output-rate",
    60
  );
  const [excludedRecipes, setExcludedRecipes] = useLocalStorage(
    "excluded-recipes",
    defaultExcludedRecipes
  );
  const [allRelevantRecipes, setAllRelevantRecipes] = useState<Recipe[]>([]);
  const [allRelevantResources, setAllRelevantResources] = useState<string[]>(
    []
  );
  const [allRelevantProducts, setAllRelevantProducts] = useState<string[]>([]);
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]);
  const [currentProducts, setCurrentProducts] = useLocalStorage<string[]>(
    "current-products",
    []
  );
  const [currentResources, setCurrentResources] = useLocalStorage<string[]>(
    "current-resources",
    []
  );
  useEffect(() => {
    const { usedProducts, usedRecipes, usedResources } =
      findAllRelatedRecipesAndProducts(
        productToProduce,
        allRecipes.filter((x) => !excludedRecipes.includes(x.recipeName))
      );
    setAllRelevantResources(usedResources);
    setAllRelevantRecipes(usedRecipes);
    setAllRelevantProducts(usedProducts);

    const storedCurrentResources = localStorage.getItem("current-resources");
    const storedCurrentProducts = localStorage.getItem("current-products");
    if (storedCurrentResources || storedCurrentProducts) {
      const resources = storedCurrentResources
        ? JSON.parse(storedCurrentResources)
        : usedResources;
      const products = storedCurrentProducts
        ? JSON.parse(storedCurrentProducts)
        : [];
      const { usedRecipes: usedRecipesNarrowed } = narrowDownRecipes(
        productToProduce,
        usedRecipes,
        resources,
        products
      );
      setCurrentRecipes(usedRecipesNarrowed);
    } else {
      setCurrentProducts([]);
      setCurrentResources(usedResources);
      setCurrentRecipes(usedRecipes);
    }
  }, [productToProduce, excludedRecipes]);
  const updateResourcesAndRecipes = (
    resources: string[],
    inputProducts: string[]
  ) => {
    setCurrentResources(resources);
    setCurrentProducts(inputProducts);
    const { usedRecipes } = narrowDownRecipes(
      productToProduce,
      allRelevantRecipes,
      resources,
      inputProducts
    );
    setCurrentRecipes(usedRecipes);
  };
  return (
    <div className="page-container">
      <Typography.Title>Satisfactory Production Optimizer</Typography.Title>
      <Form>
        <Form.Item label="Save settings">
          <Button
            onClick={() => {
              setSavedSettings([
                ...savedSettings,
                {
                  timestamp: Date.now(),
                  productToProduce,
                  wantedOutputRate,
                  currentResources,
                  currentProducts,
                },
              ]);
            }}
          >
            Save
          </Button>
        </Form.Item>
        <Form.Item label="Choose saved settings">
          <div style={{ display: "flex" }}>
            {savedSettings.map((x) => (
              <SavedSettingsButton
                key={x.timestamp}
                label={productDisplayNameMapping.get(x.productToProduce)!}
                onSelect={() => {
                  setProductToProduce(x.productToProduce);
                  setWantedOutputRate(x.wantedOutputRate);
                  const { usedProducts, usedRecipes, usedResources } =
                    findAllRelatedRecipesAndProducts(
                      x.productToProduce,
                      allRecipes.filter(
                        (x) => !excludedRecipes.includes(x.recipeName)
                      )
                    );
                  setAllRelevantResources(usedResources);
                  setAllRelevantRecipes(usedRecipes);
                  setAllRelevantProducts(usedProducts);
                  const { usedRecipes: usedRecipesNarrowed } =
                    narrowDownRecipes(
                      x.productToProduce,
                      usedRecipes,
                      x.currentResources,
                      x.currentProducts
                    );
                  setCurrentRecipes(usedRecipesNarrowed);
                  setCurrentResources(x.currentResources);
                  setCurrentProducts(x.currentProducts);
                }}
                onDelete={() => {
                  setSavedSettings(
                    savedSettings.filter((y) => y.timestamp !== x.timestamp)
                  );
                }}
              />
            ))}
          </div>
        </Form.Item>
        <div style={{ display: "flex" }}>
          <Form.Item
            label="Product"
            tooltip={{ title: "Select a product to produce" }}
            style={{ marginRight: 8, width: 400 }}
          >
            <Select
              showSearch={true}
              options={[...allProducts].map((x) => ({
                key: x,
                value: x,
                label: productDisplayNameMapping.get(x)!,
              }))}
              value={productToProduce}
              onChange={(value) => {
                localStorage.removeItem("current-resources");
                localStorage.removeItem("current-products");
                setProductToProduce(value);
              }}
              filterOption={(input, option) =>
                option!.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <div>
            <Form.Item label="Output rate (1/min)" style={{ width: 250 }}>
              <InputNumber
                value={wantedOutputRate}
                onChange={(x) => setWantedOutputRate(x ?? 0)}
              />
            </Form.Item>
          </div>
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
        </div>
        <Form.Item label="Input resources">
          <Checkbox
            style={{ marginRight: 8 }}
            onChange={(e) =>
              updateResourcesAndRecipes(
                e.target.checked ? allRelevantResources : [],
                currentProducts
              )
            }
            checked={currentResources.length === allRelevantResources.length}
            indeterminate={
              currentResources.length !== allRelevantResources.length &&
              currentResources.length > 0
            }
          >
            Select all
          </Checkbox>
          <Checkbox.Group
            options={allRelevantResources.map((x) => ({
              key: x,
              value: x,
              label: productDisplayNameMapping.get(x),
            }))}
            value={currentResources}
            onChange={(resources) =>
              updateResourcesAndRecipes(resources, currentProducts)
            }
          />
        </Form.Item>
        <Form.Item label="Input products">
          <Checkbox
            style={{ marginRight: 8 }}
            onChange={(e) =>
              updateResourcesAndRecipes(
                currentResources,
                e.target.checked ? allRelevantProducts : []
              )
            }
            checked={currentProducts.length === allRelevantProducts.length}
            indeterminate={
              currentProducts.length !== allRelevantProducts.length &&
              currentProducts.length > 0
            }
          >
            Select all
          </Checkbox>
          <Checkbox.Group
            options={allRelevantProducts.map((x) => ({
              key: x,
              value: x,
              label: productDisplayNameMapping.get(x),
            }))}
            value={currentProducts}
            onChange={(products) =>
              updateResourcesAndRecipes(currentResources, products)
            }
          />
        </Form.Item>
        <TreeBuilder
          currentRecipes={currentRecipes}
          allRelevantRecipes={allRelevantRecipes}
          productToProduce={productToProduce}
          wantedOutputRate={wantedOutputRate}
          currentProducts={currentProducts}
          removeResource={(resource) =>
            updateResourcesAndRecipes(
              currentResources.filter((x) => x !== resource),
              currentProducts
            )
          }
          addInputProduct={(product) =>
            setCurrentProducts([...currentProducts, product])
          }
        />
      </Form>
    </div>
  );
};
