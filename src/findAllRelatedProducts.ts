import { Recipe, endProducts } from "./App";

export const findAllRelatedProducts = (product: string, recipes: Recipe[]) => {
  const relatedProducts = new Set<string>();

  const recursion = (product: string) => {
    if (endProducts.includes(product)) {
      return;
    }
    relatedProducts.add(product);
    const viableRecipes = recipes.filter((x) => x.productName === product);
    for (const recipe of viableRecipes) {
      for (const ingredient of recipe.ingredients) {
        recursion(ingredient.name);
      }
    }
  };
  recursion(product);
  return [...relatedProducts];
};
