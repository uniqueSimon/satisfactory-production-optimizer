import { Button, Checkbox, Form, InputNumber, Select, Typography } from "antd";
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
  numberOfMachines: number;
  ingredients: {
    product: string;
    rate: number;
    ingredientTree: Tree[];
  }[];
}
interface SavedSetting {
  timestamp: number;
  productToProduce: string;
  wantedOutputRate: number;
  currentResources: string[];
  currentProducts: string[];
}

const defaultIncludedRecipes = [] as string[];

export const findRecipeByName = new Map<string, Recipe>();
for (const recipe of allRecipes) {
  findRecipeByName.set(recipe.recipeName, recipe);
}

const allProducts = new Set<string>();
for (const recipe of allRecipes) {
  allProducts.add(recipe.product.name);
}

export const App = () => {
  const [savedSettings, setSavedSettings] = useLocalStorage<SavedSetting[]>(
    "saved-settings",
    []
  );
  const [productToProduce, setProductToProduce] = useLocalStorage(
    "product-to-produce",
    ""
  );
  const [wantedOutputRate, setWantedOutputRate] = useLocalStorage(
    "wanted-output-rate",
    60
  );
  const [includedRecipes, setIncludedRecipes] = useLocalStorage(
    "included-recipes",
    defaultIncludedRecipes
  );
  const [allRelevantRecipes, setAllRelevantRecipes] = useLocalStorage<Recipe[]>(
    "all-relevant-recipes",
    []
  );
  const [allRelevantResources, setAllRelevantResources] = useLocalStorage<
    string[]
  >("all-relevant-resources", []);
  const [allRelevantProducts, setAllRelevantProducts] = useLocalStorage<
    string[]
  >("all-relevant-products", []);
  const [currentRecipes, setCurrentRecipes] = useLocalStorage<Recipe[]>(
    "current-recipes",
    []
  );
  const [currentProducts, setCurrentProducts] = useLocalStorage<string[]>(
    "current-products",
    []
  );
  const [currentResources, setCurrentResources] = useLocalStorage<string[]>(
    "current-resources",
    []
  );
  const onChangeProductToProduce = (chosenProduct: string) => {
    setProductToProduce(chosenProduct);
    const { usedProducts, usedRecipes, usedResources } =
      findAllRelatedRecipesAndProducts(
        chosenProduct,
        allRecipes.filter(
          (x) =>
            !x.recipeName.includes("Alternate") ||
            includedRecipes.includes(x.recipeName)
        )
      );
    setAllRelevantResources(usedResources);
    setAllRelevantRecipes(usedRecipes);
    setAllRelevantProducts(usedProducts);
    setCurrentProducts([]);
    setCurrentResources(usedResources);
    setCurrentRecipes(usedRecipes);
  };
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
  const onChooseSavedSetting = (setting: SavedSetting) => {
    setProductToProduce(setting.productToProduce);
    setWantedOutputRate(setting.wantedOutputRate);
    const { usedProducts, usedRecipes, usedResources } =
      findAllRelatedRecipesAndProducts(
        setting.productToProduce,
        allRecipes.filter(
          (x) =>
            !x.recipeName.includes("Alternate") ||
            includedRecipes.includes(x.recipeName)
        )
      );
    setAllRelevantResources(usedResources);
    setAllRelevantRecipes(usedRecipes);
    setAllRelevantProducts(usedProducts);
    const { usedRecipes: usedRecipesNarrowed } = narrowDownRecipes(
      setting.productToProduce,
      usedRecipes,
      setting.currentResources,
      setting.currentProducts
    );
    setCurrentRecipes(usedRecipesNarrowed);
    setCurrentResources(setting.currentResources);
    setCurrentProducts(setting.currentProducts);
  };
  return (
    <div style={{ margin: 10 }}>
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
            {savedSettings.map((setting) => (
              <SavedSettingsButton
                key={setting.timestamp}
                label={productDisplayNameMapping.get(setting.productToProduce)!}
                onSelect={() => onChooseSavedSetting(setting)}
                onDelete={() => {
                  setSavedSettings(
                    savedSettings.filter(
                      (x) => x.timestamp !== setting.timestamp
                    )
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
              onChange={onChangeProductToProduce}
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
          <Form.Item label="Recipes to include" style={{ width: 500 }}>
            <Select
              mode="multiple"
              allowClear={true}
              options={allRecipes
                .filter((x) => x.recipeName.includes("Alternate"))
                .map((x) => ({
                  key: x.recipeName,
                  value: x.recipeName,
                  label: x.displayName,
                }))}
              value={includedRecipes}
              onChange={(x) => setIncludedRecipes(x)}
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
