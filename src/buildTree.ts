import { Recipe, Tree } from "./App";

export const buildTree = (
  product: string,
  rate: number,
  recipes: Recipe[],
  inputProducts: string[],
  allRelevantRecipes: Recipe[]
): Tree[] => {
  if (inputProducts.includes(product)) {
    return [] as Tree[];
  }
  const viableRecipes = recipes.filter((x) => x.product.name === product);
  if (!viableRecipes.length || rate < 0) {
    return [] as Tree[];
  }
  const ret: Tree[] = [];
  viableRecipes.forEach((recipe, i) => {
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
        allRelevantRecipes
      );
      recipeTree.ingredients.push({
        product: ingredient.name,
        rate: ingredientRate,
        ingredientTree: ingredientTree,
      });
    }
    ret.push(recipeTree);
  });
  return ret;
};
