import { Recipe } from "./App";
import { Tree } from "./TreeBuilder";

export const buildTree = (
  product: string,
  rate: number,
  recipes: Recipe[],
  inputProducts: string[],
): Tree | null => {
  if (inputProducts.includes(product)) {
    return null;
  }
  const recipe = recipes.find((x) => x.product.name === product);
  if (!recipe || rate < 0) {
    return null;
  }
  const recipeTree: Tree = {
    recipeName: recipe.recipeName,
    numberOfMachines: rate / ((recipe.product.amount / recipe.time) * 60),
    ingredients: [],
  };
  for (const ingredient of recipe.ingredients) {
    const ingredientRate = (ingredient.amount / recipe.product.amount) * rate;
    const ingredientTree = buildTree(
      ingredient.name,
      ingredientRate,
      recipes,
      inputProducts,
    );
    recipeTree.ingredients.push({
      product: ingredient.name,
      rate: ingredientRate,
      ingredientTree,
    });
  }
  return recipeTree;
};
