import { Recipe } from "./App";

export const getRemainingRecipes = (
  remainingRecipes: Recipe[],
  ingredientsToRemove: string[]
): Recipe[] => {
  const newRemainingRecipes: Recipe[] = [];
  const newRemovedRecipes: Recipe[] = [];

  //look for all recipes with those ingredients to remove
  for (const item of remainingRecipes) {
    if (item.ingredients.some((x) => ingredientsToRemove.includes(x.name))) {
      newRemovedRecipes.push(item);
    } else {
      newRemainingRecipes.push(item);
    }
  }
  //go throw those removed recipes and find out of their products can still be produced by other recipes
  const notProducableProducts: string[] = [];
  for (const removedRecipe of newRemovedRecipes) {
    if (
      !newRemainingRecipes.some(
        (x) => x.productName === removedRecipe.productName
      )
    ) {
      notProducableProducts.push(removedRecipe.productName);
    }
  }
  if (notProducableProducts.length) {
    return getRemainingRecipes(newRemainingRecipes, notProducableProducts);
  }
  return newRemainingRecipes;
};
