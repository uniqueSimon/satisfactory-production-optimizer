import { Recipe } from "./App";

export const findAllRelatedRecipesAndProducts = (
  product: string,
  recipes: Recipe[]
) => {
  const usedRecipes: Recipe[] = [];
  const usedProducts: string[] = [];
  const usedResources = new Set<string>();
  const recursion = (curProduct: string) => {
    if (usedProducts.includes(curProduct)) {
      return;
    }
    const viableRecipes = recipes.filter((x) => x.product.name === curProduct);
    if (viableRecipes.length === 0) {
      usedResources.add(curProduct);
    } else {
      usedProducts.push(curProduct);
    }
    for (const recipe of viableRecipes) {
      usedRecipes.push(recipe);
      for (const ingredient of recipe.ingredients) {
        recursion(ingredient.name);
      }
    }
  };
  recursion(product);
  return {
    usedRecipes,
    usedProducts: usedProducts.filter((x) => x !== product),
    usedResources: [...usedResources],
  };
};
