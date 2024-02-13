import { Recipe, RecipeLookup } from "./App";

export const createRecipeLookup = (recipes: Recipe[]) => {
  const lookup: RecipeLookup = new Map();
  for (const recipe of recipes) {
    if (lookup.has(recipe.productName)) {
      lookup.get(recipe.productName)!.push({
        recipeName: recipe.className,
        productAmount: recipe.productAmount,
        time: recipe.time,
        ingredients: recipe.ingredients,
      });
    } else {
      lookup.set(recipe.productName, [
        {
          recipeName: recipe.className,
          productAmount: recipe.productAmount,
          time: recipe.time,
          ingredients: recipe.ingredients,
        },
      ]);
    }
  }
  return lookup;
};
