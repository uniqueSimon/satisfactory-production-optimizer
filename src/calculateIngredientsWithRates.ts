import { endProducts, recipeLookup } from "./App";
import { generateCombinations } from "./generateCombinations";

export const calculateIngredientsWithRates = (
  product: string,
  rate: number
): { product: string; rate: number }[][] => {
  if (endProducts.includes(product)) {
    return [[{ product, rate }]];
  }
  const viableRecipes = recipeLookup.get(product)!;
  const ret: { product: string; rate: number }[][] = [];
  for (const recipe of viableRecipes) {
    const ingredients: { product: string; rate: number }[][][] = [];
    for (const ingredient of recipe.ingredients) {
      const ingredientsWithRates = calculateIngredientsWithRates(
        ingredient.name,
        (rate * ingredient.amount) / recipe.productAmount
      );
      ingredients.push(ingredientsWithRates);
    }

    const combinations = generateCombinations(ingredients.map((x) => x.length));
    const resultingIngredientVariants: {
      product: string;
      rate: number;
    }[][] = [];
    for (const combination of combinations) {
      const concatenatedIngredients: { product: string; rate: number }[] = [];
      for (const ingredientIndex in combination) {
        const variant = combination[ingredientIndex];
        const ingredientVariant = ingredients[ingredientIndex][variant];
        concatenatedIngredients.push(...ingredientVariant);
      }
      resultingIngredientVariants.push(concatenatedIngredients);
    }
    ret.push(...resultingIngredientVariants);
  }
  return ret;
};
