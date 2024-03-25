import { Recipe } from "./App";

export const findAllRelatedRecipesAndProducts = (
  product: string,
  recipes: Recipe[]
) => {
  const usedRecipes: Recipe[] = [];
  const usedProducts: string[] = [];
  const usedResources = new Set<string>();
  const recursion = (product: string) => {
    if (usedProducts.includes(product)) {
      return;
    }
    const viableRecipes = recipes.filter((x) => x.product.name === product);
    if (viableRecipes.length === 0) {
      usedResources.add(product);
    } else {
      usedProducts.push(product);
    }
    for (const recipe of viableRecipes) {
      usedRecipes.push(recipe);
      for (const ingredient of recipe.ingredients) {
        recursion(ingredient.name);
      }
    }
  };
  recursion(product);
  return { usedRecipes, usedProducts, usedResources: [...usedResources] };
};
