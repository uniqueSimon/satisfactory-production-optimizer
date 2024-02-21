import { getRecipesFromConfig } from "./getRecipesFromConfig";
import { createRecipeLookup } from "./createRecipeLookup";
import { RecipeOverview } from "./RecipeOverview";
import { calculationBottomUp } from "./calculationBottomUp";
import { BestRecipesOfProducts } from "./BestRecipesOfProduct";
import { createIngredientFinder } from "./createIngredientFinder";
import relevantProducts from "./relevantProducts.json";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";
import { findAllRelatedRecipesAndProducts } from "./findAllRelatedRecipes";

export interface Recipe {
  recipeName: string;
  productName: string;
  productAmount: number;
  ingredients: { name: string; amount: number }[];
  time: number;
}

const allRecipes = getRecipesFromConfig();

export const App = () => {
  const [productToProduce, setProductToProduce] = useState(relevantProducts[0]);
  const { usedRecipes, usedProducts } = findAllRelatedRecipesAndProducts(
    productToProduce,
    allRecipes
  );
  console.log(
    "usedRecipes",
    usedRecipes.map((x) => ({
      recipeName: x.recipeName,
      productName: x.productName,
      ingredients: x.ingredients.map((y) => y.name).join(", "),
    }))
  );
  console.log("usedProducts", usedProducts);
  const [recipesToChooseFrom, setRecipesToChooseFrom] = useState<Recipe[]>([]);
  useEffect(() => setRecipesToChooseFrom(usedRecipes), [productToProduce]);
  const recipeLookup = createRecipeLookup(recipesToChooseFrom);
  const ingredientFinder = createIngredientFinder(recipesToChooseFrom);

  const productResults = calculationBottomUp(usedProducts, recipeLookup);
  const recipeVariants = productResults.get(productToProduce)!;
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
        <Form.Item label="Select all wanted recipes">
          <Select
            mode="multiple"
            options={usedRecipes.map((x) => ({
              key: x.recipeName,
              value: x.recipeName,
              label: x.recipeName,
            }))}
            value={recipesToChooseFrom.map((x) => x.recipeName)}
            onChange={(x) => {
              const recipes = usedRecipes.filter((recipe) =>
                x.includes(recipe.recipeName)
              );
              setRecipesToChooseFrom(recipes);
            }}
          />
        </Form.Item>
      </Form>
      <Select
        mode="multiple"
        options={[{ value: "someValue", label: "someLabel" }]}
      />
      <BestRecipesOfProducts
        recipeVariants={recipeVariants ?? []}
        ingredientFinder={ingredientFinder}
      />
      <RecipeOverview recipeLookup={recipeLookup} />
      <pre>{JSON.stringify(allRecipes, null, 2)}</pre>
    </>
  );
};
