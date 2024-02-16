import { Recipe } from "./App";

export const createIngredientFinder = (recipes: Recipe[]) => {
  const lookup = new Map<string, string[]>();
  for (const recipe of recipes) {
    lookup.set(
      recipe.className,
      recipe.ingredients.map((x) => x.name)
    );
  }
  return lookup;
};
