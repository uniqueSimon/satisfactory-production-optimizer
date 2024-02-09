import { ProductionUnit, Recipe, endProducts } from "./App";

export const calculateProductionSetup = (
  product: string,
  rate: number,
  recipeOfEachProd: Map<string, number>,
  recipes: Recipe[]
) => {
  if (endProducts.includes(product)) {
    return [{ product, rate }];
  }
  const alternateRecipeSequence: ProductionUnit[] = [];
  const viableRecipes = recipes.filter((x) => x.productName === product);
  const variant = recipeOfEachProd.get(product);
  const recipe = viableRecipes[variant!];
  if(!recipe){
    console.log('product',product)
  }
  const baseRate = recipe.productAmount / (recipe.time / 60);
  const numberOfMachines = rate / baseRate;
  const recipeName = recipe.className;
  const prodVar = { product, variant, rate, numberOfMachines, recipeName };
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
