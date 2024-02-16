import { endProducts, recipeLookup } from "./App";
import { generateCombinations } from "./generateCombinations";

const cachedResults = new Map<string, Ingredient[][]>();
interface Ingredient {
  recipeNames: string[];
  product: string;
  rate: number;
}
export const calculateIngredientsWithRates = (
  product: string,
  rate: number
) => {
  if (endProducts.includes(product)) {
    return [[{ recipeNames: [], product, rate }]];
  }
  const viableRecipes = recipeLookup.get(product)!;
  const ret: Ingredient[][] = [];
  for (const recipe of viableRecipes) {
    const ingredients: Ingredient[][][] = [];
    for (const ingredient of recipe.ingredients) {
      if (cachedResults.has(ingredient.name)) {
        ingredients.push(cachedResults.get(ingredient.name)!);
      } else {
        const ingredientsWithRatesNormalized = calculateIngredientsWithRates(
          ingredient.name,
          1
        );
        cachedResults.set(ingredient.name, ingredientsWithRatesNormalized);
        const ingredienteRate =
          (rate * ingredient.amount) / recipe.productAmount;
        const ingredientsWithRates = ingredientsWithRatesNormalized.map((x) =>
          x.map((y) => ({ ...y, rate: y.rate * ingredienteRate }))
        );
        ingredients.push(ingredientsWithRates);
      }
    }

    const combinations = generateCombinations(ingredients.map((x) => x.length));
    const resultingIngredientVariants: Ingredient[][] = [];
    for (const combination of combinations) {
      const concatenatedIngredients: Ingredient[] = [];
      for (const ingredientIndex in combination) {
        const variant = combination[ingredientIndex];
        const ingredientVariant = ingredients[ingredientIndex][variant].map(
          (x) => ({
            ...x,
            recipeNames: [...x.recipeNames, recipe.recipeName],
          })
        );
        concatenatedIngredients.push(...ingredientVariant);
      }
      resultingIngredientVariants.push(concatenatedIngredients);
    }
    ret.push(...resultingIngredientVariants);
  }
  return ret;
};
