import { ProductionUnit, endProducts, recipeLookup } from "./App";

export const calculateProductionSetup = (
  product: string,
  rate: number,
  recipeOfEachProd: Map<string, number>
) => {
  if (endProducts.includes(product)) {
    return [{ product, rate }];
  }
  const alternateRecipeSequence: ProductionUnit[] = [];
  const viableRecipes = recipeLookup.get(product)!;
  const variant = recipeOfEachProd.get(product);
  const recipe = viableRecipes[variant!];
  const baseRate = recipe.productAmount / (recipe.time / 60);
  const numberOfMachines = rate / baseRate;
  const recipeName = recipe.recipeName;
  const prodVar = { product, variant, rate, numberOfMachines, recipeName };
  for (const ingredient of recipe.ingredients) {
    const recipeSequence = calculateProductionSetup(
      ingredient.name,
      (rate * ingredient.amount) / recipe.productAmount,
      recipeOfEachProd
    );
    alternateRecipeSequence.push(...recipeSequence);
  }
  return [prodVar, ...alternateRecipeSequence];
};
