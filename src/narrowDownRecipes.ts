import { Recipe } from "./App";

export const narrowDownRecipes = (
  product: string,
  recipes: Recipe[],
  resources: string[],
  inputProducts: string[]
) => {
  const usedRecipes: Recipe[] = [];
  const usedProducts: string[] = [];

  const canProductBeProduced = (curProduct: string) => {
    if (
      usedProducts.includes(curProduct) ||
      resources.includes(curProduct) ||
      inputProducts.includes(curProduct)
    ) {
      return true;
    }
    let productCanBeProduced = false;
    const viableRecipes = recipes.filter((x) => x.product.name === curProduct);
    for (const recipe of viableRecipes) {
      let recipeIsValid = true;
      for (const ingredient of recipe.ingredients) {
        if (ingredient.amount < 0) {
          continue;
        }
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
      curProduct !== product && usedProducts.push(curProduct);
      return true;
    }
    return false;
  };
  canProductBeProduced(product);

  return { usedRecipes, usedProducts };
};
