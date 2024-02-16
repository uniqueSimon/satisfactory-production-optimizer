import { LookedUpRecipe, Recipe, recipeLookup } from "./App";
import { generateCombinations } from "./generateCombinations";

interface RecipeVariant {
  resources: Map<string, number>;
  details: Details[];
}
interface Details {
  recipeNames: string[];
  product: string;
  rate: number;
}

export const calculationBottomUp = (recipes: Recipe[]) => {
  const productResults = new Map<string, RecipeVariant[]>();

  for (const resource of ["OreIron", "OreCopper", "Coal"]) {
    productResults.set(resource, [
      {
        resources: new Map([[resource, 1]]),
        details: [{ product: resource, rate: 1, recipeNames: [] }],
      },
    ]);
  }
  const allProducts = new Set(recipes.map((x) => x.productName));
  while (allProducts.size > 0) {
    for (const product of allProducts) {
      const viableRecipes = recipeLookup.get(product)!;
      const allIngredientsAreKnown = !viableRecipes.some((x) =>
        x.ingredients.some((y) => !productResults.has(y.name))
      );
      if (allIngredientsAreKnown) {
        
        const result: RecipeVariant[] = [];
        for (const recipe of viableRecipes) {
          const ingredients = getResultsFromIngredients(recipe, productResults);
          const combinations = generateCombinations(
            ingredients.map((x) => x.length)
          );
          const allRecipeVariants: RecipeVariant[] = [];
          for (const combination of combinations) {
            const recipeVariant = calculateRecipeVariant(
              ingredients,
              combination,
              recipe
            );
            allRecipeVariants.push(recipeVariant);
          }
          result.push(...allRecipeVariants);
        }
        productResults.set(product, result);
        allProducts.delete(product);
      }
    }
  }
  return productResults;
};

const getResultsFromIngredients = (
  recipe: LookedUpRecipe,
  cachedResults: Map<string, RecipeVariant[]>
) => {
  const ret: RecipeVariant[][] = [];
  for (const ingredient of recipe.ingredients) {
    const ingredienteRate = ingredient.amount / recipe.productAmount;
    const normalized = cachedResults.get(ingredient.name)!;
    const withRates = normalized.map((y) => {
      const resources = new Map<string, number>();
      y.resources.forEach((rate, resource) => {
        resources.set(resource, rate * ingredienteRate);
      });
      const details = y.details.map((z) => ({
        ...z,
        rate: z.rate * ingredienteRate,
      }));
      return { resources, details };
    });
    ret.push(withRates);
  }
  return ret;
};

const calculateRecipeVariant = (
  ingredients: RecipeVariant[][],
  combination: number[],
  recipe: LookedUpRecipe
): RecipeVariant => {
  const resources = new Map<string, number>();
  const details: Details[] = [];
  for (const ingredientIndex in combination) {
    const variant = combination[ingredientIndex];
    const ingredientVariant = ingredients[ingredientIndex][variant];

    const ingredientDetails = ingredientVariant.details.map((x) => ({
      ...x,
      recipeNames: [...x.recipeNames, recipe.recipeName],
    }));
    details.push(...ingredientDetails);

    ingredientVariant.resources.forEach((rate, resource) => {
      const oldRate = resources.get(resource);
      resources.set(resource, (oldRate ?? 0) + rate);
    });
  }
  return { resources, details };
};
