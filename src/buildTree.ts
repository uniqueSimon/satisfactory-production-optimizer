import { Recipe, Tree } from "./App";

export const buildTree = (product: string, rate: number, recipes: Recipe[]) => {
  const viableRecipes = recipes.filter((x) => x.products[0].name === product);
  const ret: Tree[] = [];
  for (const recipe of viableRecipes) {
    const recipeTree: Tree = {
      recipeName: recipe.recipeName,
      numberOfMachines: rate / ((recipe.products[0].amount / recipe.time) * 60),
      ingredients: [],
    };
    for (const ingredient of recipe.ingredients) {
      const ingredientRate =
        (ingredient.amount / recipe.products[0].amount) * rate;
      recipeTree.ingredients.push({
        product: ingredient.name,
        rate: ingredientRate,
        ingredientTree: buildTree(ingredient.name, ingredientRate, recipes),
      });
    }
    ret.push(recipeTree);
  }
  return ret;
};
