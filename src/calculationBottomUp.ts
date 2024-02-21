import { Recipe } from "./App";
import { generateCombinations } from "./generateCombinations";
export interface RecipeVariant {
  resourceTypes: Set<string>;
  resources: Map<string, number>;
  details: Details[];
}
interface Details {
  recipeNames: string[];
  product: string;
  rate: number;
}

export const calculationBottomUp = (
  products: string[],
  recipeLookup: Map<string, Recipe[]>
) => {
  const productResults = new Map<string, RecipeVariant[]>();
  const allProducts = new Set(products);
  let i = 0;
  while (allProducts.size > 0 && i < 100) {
    for (const product of allProducts) {
      const viableRecipes = recipeLookup.get(product);
      if (!viableRecipes) {
        console.log("bottomUp: no recipe for", product);
        continue;
      }
      const allIngredientsAreKnown = viableRecipes.every((x) =>
        x.ingredients.every(
          (y) => productResults.has(y.name) || !allProducts.has(y.name)
        )
      );
      if (allIngredientsAreKnown) {
        const recipeVariants: RecipeVariant[] = [];
        for (const recipe of viableRecipes) {
          const ingredients = getResultsFromIngredients(recipe, productResults);
          const combinations = generateCombinations(
            ingredients.map((x) => x.length)
          );
          for (const combination of combinations) {
            const recipeVariant = calculateRecipeVariant(
              ingredients,
              combination,
              recipe
            );
            recipeVariants.push(recipeVariant);
          }
        }
        const filteredRecipeVariants =
          filterOutInefficientVariants(recipeVariants);
        productResults.set(product, filteredRecipeVariants);
        allProducts.delete(product);
      }
    }
    console.log("bottomUp: remaining products", allProducts);
    i++;
  }
  return productResults;
};

const getResultsFromIngredients = (
  recipe: Recipe,
  productResults: Map<string, RecipeVariant[]>
) => {
  const ret: RecipeVariant[][] = [];
  for (const ingredient of recipe.ingredients) {
    const ingredienteRate = ingredient.amount / recipe.productAmount;
    const normalized = productResults.get(ingredient.name) ?? [
      {
        resourceTypes: new Set([ingredient.name]),
        resources: new Map([[ingredient.name, 1]]),
        details: [{ product: ingredient.name, rate: 1, recipeNames: [] }],
      },
    ];
    const withRates = normalized.map((y) => {
      const resources = new Map<string, number>();
      y.resources.forEach((rate, resource) => {
        resources.set(resource, rate * ingredienteRate);
      });
      const details = y.details.map((z) => ({
        ...z,
        rate: z.rate * ingredienteRate,
      }));
      return { resourceTypes: y.resourceTypes, resources, details };
    });
    ret.push(withRates);
  }
  return ret;
};

const calculateRecipeVariant = (
  ingredients: RecipeVariant[][],
  combination: number[],
  recipe: Recipe
): RecipeVariant => {
  const resources = new Map<string, number>();
  const details: Details[] = [];
  const resourceTypes = new Set<string>();
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
    ingredientVariant.resourceTypes.forEach((x) => resourceTypes.add(x));
  }
  return { resources, details, resourceTypes };
};

const filterOutInefficientVariants = (recipeVariants: RecipeVariant[]) => {
  const groupedByResourceTypes = new Map<string, RecipeVariant>();
  for (const recipeVariant of recipeVariants) {
    const key = Array.from(recipeVariant.resourceTypes).sort().join(",");
    const existing = groupedByResourceTypes.get(key);
    if (existing) {
      const oldTotalRate = existing.details.reduce((acc, x) => {
        return acc + x.rate;
      }, 0);
      const newTotalRate = recipeVariant.details.reduce((acc, x) => {
        return acc + x.rate;
      }, 0);
      if (newTotalRate < oldTotalRate) {
        groupedByResourceTypes.set(key, recipeVariant);
      }
    } else {
      groupedByResourceTypes.set(key, recipeVariant);
    }
  }
  return Array.from(groupedByResourceTypes.values());
};
