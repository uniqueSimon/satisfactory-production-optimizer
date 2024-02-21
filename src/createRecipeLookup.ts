import { Recipe } from "./App";

export const createRecipeLookup = (recipes: Recipe[]) => {
  const lookup = new Map<string, Recipe[]>();
  for (const recipe of recipes) {
    const prevEntry = lookup.get(recipe.productName);
    if (prevEntry) {
      prevEntry.push(recipe);
    } else {
      lookup.set(recipe.productName, [recipe]);
    }
  }
  return lookup;
};
