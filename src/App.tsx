import {
  Button,
  Checkbox,
  Form,
  InputNumber,
  Radio,
  Select,
  Table,
  Typography,
} from "antd";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";
import { productDisplayNameMapping } from "./getProductDisplayNames";
import { ProducedIn, allRecipes } from "./allRecipesFromConfig";

import { TreeBuilder } from "./TreeBuilder";
import { useLocalStorage } from "./useLocalStorage";
import { SavedSettingsButton } from "./SavedSettingsButton";
import { useEffect, useState } from "react";

export interface Recipe {
  recipeName: string;
  displayName: string;
  product: { name: string; amount: number };
  ingredients: { name: string; amount: number }[];
  time: number;
  isAlternate: boolean;
  producedIn: ProducedIn | "CUSTOM";
}
interface SavedSetting {
  timestamp: number;
  productToProduce: string;
  wantedOutputRate: number;
  inputProducts: string[];
  selectedAltRecipes: string[];
}

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
  const [foundAltRecipes, setFoundAltRecipes] = useLocalStorage<string[]>(
    "found-alt-recipes",
    []
  );
  const [productToProduce, setProductToProduce] = useState("");
  const [wantedOutputRate, setWantedOutputRate] = useState(60);
  const [selectedAltRecipes, setSelectedAltRecipes] = useState<string[]>([]);
  const [recipeSelection, setRecipeSelection] = useState(
    new Map<string, { recipes: string[]; selected: string }>()
  );
  const [allRelevantRecipes, setAllRelevantRecipes] = useState<Recipe[]>([]);
  const [allRelevantProducts, setAllRelevantProducts] = useState<string[]>([]);
  const [inputProducts, setInputProducts] = useState<string[]>([]);
  const recalculateRelevantRecipes = (
    chosenProduct: string,
    foundAltRecipes: string[]
  ) => {
    const { relevantProducts, relevantRecipes } =
      findAllRelatedRecipesAndProducts(
        chosenProduct,
        allRecipes.filter(
          (x) => !x.isAlternate || foundAltRecipes.includes(x.recipeName)
        )
      );
    setAllRelevantRecipes(relevantRecipes);
    setAllRelevantProducts(relevantProducts);
    setInputProducts([]);
  };
  useEffect(() => {
    if (productToProduce) {
      const groupedRecipes = new Map<
        string,
        { recipes: string[]; selected: string }
      >();
      for (const product of [productToProduce, ...allRelevantProducts]) {
        const recipes = allRelevantRecipes.filter(
          (x) => x.product.name === product
        );
        const foundSelection = recipes.find((x) =>
          selectedAltRecipes.includes(x.recipeName)
        );
        groupedRecipes.set(product, {
          recipes: recipes.map((x) => x.recipeName),
          selected:
            foundSelection?.recipeName ??
            recipes.find((x) => !x.isAlternate)!.recipeName,
        });
      }
      setRecipeSelection(groupedRecipes);
    }
  }, [allRelevantRecipes, allRelevantProducts]);
  const onChooseSavedSetting = (setting: SavedSetting) => {
    setProductToProduce(setting.productToProduce);
    setWantedOutputRate(setting.wantedOutputRate);
    setSelectedAltRecipes(setting.selectedAltRecipes);
    setInputProducts(setting.inputProducts);
    recalculateRelevantRecipes(setting.productToProduce, foundAltRecipes);
  };
  const selectedRecipes: Recipe[] = [];
  recipeSelection.forEach((value) => {
    const recipe = findRecipeByName.get(value.selected)!;
    selectedRecipes.push(recipe);
  });
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
                  inputProducts,
                  selectedAltRecipes,
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
              onChange={(chosenProduct) => {
                setProductToProduce(chosenProduct);
                recalculateRelevantRecipes(chosenProduct, foundAltRecipes);
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
          <Form.Item label="Found alternate recipes" style={{ width: 500 }}>
            <Select
              mode="multiple"
              allowClear={true}
              options={allRecipes
                .filter((x) => x.isAlternate)
                .map((x, i) => ({
                  key: i,
                  value: x.recipeName,
                  label: x.displayName,
                }))}
              value={foundAltRecipes}
              onChange={(x) => {
                setFoundAltRecipes(x);
                recalculateRelevantRecipes(productToProduce, x);
              }}
            />
          </Form.Item>
        </div>
        <Table
          columns={[
            { dataIndex: "product", title: "Product" },
            { dataIndex: "selection", title: "Selection" },
          ]}
          dataSource={Array.from(recipeSelection).map((x, i) => ({
            key: i,
            product: x[0],
            selection: (
              <Radio.Group
                options={x[1].recipes.map((y) => ({
                  label: y,
                  value: y,
                }))}
                value={x[1].selected}
                onChange={(e) => {
                  setRecipeSelection((prev) => {
                    const prevEntry = prev.get(x[0])!;
                    const newAltSelection = selectedAltRecipes.filter(
                      (x) => x !== prevEntry.selected
                    );
                    if (e.target.value.includes("Alternate_")) {
                      newAltSelection.push(e.target.value);
                    }
                    setSelectedAltRecipes(newAltSelection);
                    prev.set(x[0], { ...prevEntry, selected: e.target.value });
                    return new Map(prev);
                  });
                }}
              />
            ),
          }))}
        />
        <Form.Item label="Input products">
          <Checkbox
            style={{ marginRight: 8 }}
            onChange={(e) =>
              setInputProducts(e.target.checked ? allRelevantProducts : [])
            }
            checked={inputProducts.length === allRelevantProducts.length}
            indeterminate={
              inputProducts.length !== allRelevantProducts.length &&
              inputProducts.length > 0
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
            value={inputProducts}
            onChange={(products) => setInputProducts(products)}
          />
        </Form.Item>
        <TreeBuilder
          currentRecipes={selectedRecipes}
          allRelevantRecipes={allRelevantRecipes}
          productToProduce={productToProduce}
          wantedOutputRate={wantedOutputRate}
          currentProducts={inputProducts}
          addInputProduct={(product) =>
            setInputProducts([...inputProducts, product])
          }
        />
      </Form>
    </div>
  );
};
