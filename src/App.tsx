import { Form, InputNumber, Select, Typography } from "antd";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";
import { ProducedIn, allRecipes } from "./allRecipesFromConfig";

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
  const [inputProducts, setInputProducts] = useState<string[]>([]);

  const { relevantProducts, relevantRecipes } =
    findAllRelatedRecipesAndProducts(
      productToProduce,
      allRecipes.filter(
        (x) => !x.isAlternate || foundAltRecipes.includes(x.recipeName)
      )
    );

  return (
    <div style={{ border: "solid" }}>
      <Typography.Title>Satisfactory Production Optimizer</Typography.Title>
      <Form>
        <SavedSettings
          inputProducts={inputProducts}
          productToProduce={productToProduce}
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
            setProductToProduce={setProductToProduce}
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
              onChange={setFoundAltRecipes}
            />
          </Form.Item>
        </div>
        <App2
          allRelevantRecipes={relevantRecipes}
          allRelevantProducts={relevantProducts}
          productToProduce={productToProduce}
          selectedAltRecipes={selectedAltRecipes}
          setSelectedAltRecipes={setSelectedAltRecipes}
          inputProducts={inputProducts}
          setInputProducts={setInputProducts}
          wantedOutputRate={wantedOutputRate}
        />
      </Form>
    </div>
  );
};
const App2 = (props: {
  allRelevantRecipes: Recipe[];
  allRelevantProducts: string[];
  productToProduce: string;
  selectedAltRecipes: string[];
  setSelectedAltRecipes: (selectedAltRecipes: string[]) => void;
  inputProducts: string[];
  setInputProducts: (inputProducts: string[]) => void;
  wantedOutputRate: number;
}) => {
  return (
    <div style={{ border: "solid" }}>
      <InputProducts
        allRelevantProducts={props.allRelevantProducts}
        inputProducts={props.inputProducts}
        setInputProducts={props.setInputProducts}
      />
      <App1
        allRelevantRecipes={props.allRelevantRecipes}
        allRelevantProducts={props.allRelevantProducts}
        productToProduce={props.productToProduce}
        selectedAltRecipes={props.selectedAltRecipes}
        setSelectedAltRecipes={props.setSelectedAltRecipes}
        inputProducts={props.inputProducts}
        wantedOutputRate={props.wantedOutputRate}
      />
    </div>
  );
};
const App1 = (props: {
  allRelevantRecipes: Recipe[];
  allRelevantProducts: string[];
  productToProduce: string;
  selectedAltRecipes: string[];
  setSelectedAltRecipes: (selectedAltRecipes: string[]) => void;
  inputProducts: string[];
  wantedOutputRate: number;
}) => {
  const [recipeSelection, setRecipeSelection] = useState(
    new Map<string, { recipes: string[]; selected: string }>()
  );
  useEffect(() => {
    if (props.allRelevantRecipes.length) {
      const groupedRecipes = new Map<
        string,
        { recipes: string[]; selected: string }
      >();
      for (const product of [
        props.productToProduce,
        ...props.allRelevantProducts,
      ]) {
        const recipes = props.allRelevantRecipes.filter(
          (x) => x.product.name === product
        );
        const foundSelection = recipes.find((x) =>
          props.selectedAltRecipes.includes(x.recipeName)
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
  }, [props.allRelevantRecipes, props.allRelevantProducts]);

  return (
    <RecipeSelection
      recipeSelection={recipeSelection}
      selectedAltRecipes={props.selectedAltRecipes}
      setRecipeSelection={setRecipeSelection}
      setSelectedAltRecipes={props.setSelectedAltRecipes}
      inputProducts={props.inputProducts}
      productToProduce={props.productToProduce}
      wantedOutputRate={props.wantedOutputRate}
    />
  );
};
