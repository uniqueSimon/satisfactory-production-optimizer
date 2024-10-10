import { Recipe } from "./App";

export const findAllRelatedRecipesAndProducts = (
  product: string,
  recipes: Recipe[]
) => {
  const relevantRecipes: Recipe[] = [];
  const relevantProducts: string[] = [];
  const relevantResources = new Set<string>();
  const recursion = (curProduct: string) => {
    if (relevantProducts.includes(curProduct)) {
      return;
    }
    const viableRecipes = recipes.filter((x) => x.product.name === curProduct);
    if (viableRecipes.length === 0) {
      relevantResources.add(curProduct);
    } else {
      relevantProducts.push(curProduct);
    }
    for (const recipe of viableRecipes) {
      relevantRecipes.push(recipe);
      for (const ingredient of recipe.ingredients) {
        recursion(ingredient.name);
      }
    }
  };
  recursion(product);
  return {
    relevantRecipes,
    relevantProducts: relevantProducts.filter((x) => x !== product),
    relevantResources: [...relevantResources],
  };
};
