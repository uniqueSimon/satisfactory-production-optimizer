import { Recipe, endProducts } from "./App";

export const findAllRelatedRecipes = (product: string, recipes: Recipe[]) => {
  const usedRecipes: Recipe[] = [];
  const recursion = (product: string) => {
    if (endProducts.includes(product)) {
      return;
    }
    const viableRecipes = recipes.filter((x) => x.productName === product);
    for (const recipe of viableRecipes) {
      if (!usedRecipes.includes(recipe)) {
        usedRecipes.push(recipe);
      }
      for (const ingredient of recipe.ingredients) {
        recursion(ingredient.name);
      }
    }
  };
  recursion(product);

  return usedRecipes;
};
