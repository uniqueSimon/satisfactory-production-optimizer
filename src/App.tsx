import { Form, InputNumber, Select, Typography } from "antd";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";
import { ProducedIn, allRecipes } from "./allRecipesFromConfig";

import { TreeBuilder } from "./TreeBuilder";
import { useLocalStorage } from "./useLocalStorage";
import { useEffect, useState } from "react";
import { RecipeSelection } from "./RecipeSelection";
import { InputProducts } from "./InputProducts";
import { SavedSettings } from "./SavedSettings";
import { ProductToProduce } from "./ProductToProduce";

export interface Recipe {
  recipeName: string;
  displayName: string;
  product: { name: string; amount: number };
  ingredients: { name: string; amount: number }[];
  time: number;
  isAlternate: boolean;
  producedIn: ProducedIn | "CUSTOM";
}
export const findRecipeByName = new Map<string, Recipe>();
for (const recipe of allRecipes) {
  findRecipeByName.set(recipe.recipeName, recipe);
}

export const App = () => {
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
  const selectedRecipes: Recipe[] = [];
  recipeSelection.forEach((value) => {
    const recipe = findRecipeByName.get(value.selected)!;
    selectedRecipes.push(recipe);
  });
  return (
    <div style={{ margin: 10 }}>
      <Typography.Title>Satisfactory Production Optimizer</Typography.Title>
      <Form>
        <SavedSettings
          inputProducts={inputProducts}
          productToProduce={productToProduce}
          recalculateRelevantRecipes={(productToProduce) => {
            recalculateRelevantRecipes(productToProduce, foundAltRecipes);
          }}
          selectedAltRecipes={selectedAltRecipes}
          setInputProducts={setInputProducts}
          setProductToProduce={setProductToProduce}
          setSelectedAltRecipes={setSelectedAltRecipes}
          setWantedOutputRate={setWantedOutputRate}
          wantedOutputRate={wantedOutputRate}
        />
        <div style={{ display: "flex" }}>
          <ProductToProduce
            productToProduce={productToProduce}
            setProductToProduce={(chosenProduct) => {
              setProductToProduce(chosenProduct);
              recalculateRelevantRecipes(chosenProduct, foundAltRecipes);
            }}
          />
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
        <RecipeSelection
          recipeSelection={recipeSelection}
          selectedAltRecipes={selectedAltRecipes}
          setRecipeSelection={setRecipeSelection}
          setSelectedAltRecipes={setSelectedAltRecipes}
        />
        <InputProducts
          allRelevantProducts={allRelevantProducts}
          inputProducts={inputProducts}
          setInputProducts={setInputProducts}
        />
        <TreeBuilder
          currentRecipes={selectedRecipes}
          allRelevantRecipes={allRelevantRecipes}
          productToProduce={productToProduce}
          wantedOutputRate={wantedOutputRate}
          currentProducts={inputProducts}
        />
      </Form>
    </div>
  );
};
