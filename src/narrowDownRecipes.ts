import { Recipe } from "./App";

export const narrowDownRecipes = (
  product: string,
  recipes: Recipe[],
  resources: string[]
) => {
  const usedRecipes: Recipe[] = [];
  const usedProducts: string[] = [];

  const canProductBeProduced = (product: string) => {
    if (usedProducts.includes(product) || resources.includes(product)) {
      return true;
    }
    let productCanBeProduced = false;
    const viableRecipes = recipes.filter((x) => x.products[0].name === product);
    for (const recipe of viableRecipes) {
      let recipeIsValid = true;
      for (const ingredient of recipe.ingredients) {
        const isProducable = canProductBeProduced(ingredient.name);
        if (!isProducable) {
          recipeIsValid = false;
          break;
        }
      }
      if (recipeIsValid) {
        productCanBeProduced = true;
        usedRecipes.push(recipe);
      }
    }
    if (productCanBeProduced) {
      usedProducts.push(product);
      return true;
    }
    return false;
  };
  canProductBeProduced(product);
  return usedRecipes;
};
