import { Recipe } from "./App";

export const getRelevantRecipes = (
  allRecipes: Recipe[],
  relevantProducts: string[]
): Recipe[] => {
  const ret: Recipe[] = [];
  for (const recipe of allRecipes) {
    if (
      relevantProducts.includes(recipe.productName) &&
      recipe.ingredients.every((x) => relevantProducts.includes(x.name))
    ) {
      ret.push(recipe);
    }
  }
  return ret;
};
