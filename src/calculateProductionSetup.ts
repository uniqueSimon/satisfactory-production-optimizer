import { Recipe, endProducts } from "./App";

export const calculateProductionSetup = (
  product: string,
  rate: number,
  recipeOfEachProd: Map<string, number>,
  recipes: Recipe[]
) => {
  if (endProducts.includes(product)) {
    return [{ product, rate }];
  }
  const alternateRecipeSequence: {
    product: string;
    rate: number;
    numberOfMachines?: number;
    variant?: number;
  }[] = [];
  const viableRecipes = recipes.filter((x) => x.productName === product);
  const variant = recipeOfEachProd.get(product) ?? 0;
  const recipe = viableRecipes[variant];
  const baseRate = recipe.productAmount / (recipe.time / 60);
  const numberOfMachines = rate / baseRate;
  const prodVar = { product, variant, rate, numberOfMachines };
  for (const ingredient of recipe.ingredients) {
    const recipeSequence = calculateProductionSetup(
      ingredient.name,
      (rate * ingredient.amount) / recipe.productAmount,
      recipeOfEachProd,
      recipes
    );
    alternateRecipeSequence.push(...recipeSequence);
  }
  return [prodVar, ...alternateRecipeSequence];
};
