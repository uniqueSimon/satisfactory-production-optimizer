import { LookedUpRecipe, Recipe } from "./App";
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
  recipes: Recipe[],
  recipeLookup: Map<string, LookedUpRecipe[]>
) => {
  const productResults = new Map<string, RecipeVariant[]>();

  for (const resource of ["OreIron", "OreCopper", "Coal"]) {
    productResults.set(resource, [
      {
        resourceTypes: new Set([resource]),
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
        const recipeVariants: RecipeVariant[] = [];
        for (const recipe of viableRecipes) {
          /* 
          const concatenatedRecipes = recipe.ingredients.map(
            (x) => productResults.get(x.name)!
          );
          const totalCombinations = concatenatedRecipes
            .map((x) => x.length)
            .reduce((acc, val) => acc * val, 1);

          for (let i = 0; i < totalCombinations; i++) {
            let j = i;
            const combination = concatenatedRecipes.map((x) => {
              const recipeVariant = x[j % x.length];
              j = Math.floor(j / x.length);
              return recipeVariant;
            });
          }
          const allVariantsOfIngredients = new Map<number, RecipeVariant[]>();
          for (const ingredient of recipe.ingredients) {
            const normalized = productResults.get(ingredient.name)!;
            for (const ingredientVariant of normalized) {
              allVariantsOfIngredients.set(ingredientVariant);
            }
          }
 */
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

            addNewVariantToArray(recipeVariant, recipeVariants);
          }
        }
        productResults.set(product, recipeVariants);
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
      return { resourceTypes: y.resourceTypes, resources, details };
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

const addNewVariantToArray = (
  recipeVariant: RecipeVariant,
  recipeVariants: RecipeVariant[]
) => {
  let shouldPush = true;
  let replaceIndex: number | null = null;
  let i = 0;
  for (const oldRecipeVariant of recipeVariants) {
    if (
      setsAreEqual(recipeVariant.resourceTypes, oldRecipeVariant.resourceTypes)
    ) {
      let partlyMoreEfficient = false;
      let moreEfficient = true;
      for (const resource of recipeVariant.resourceTypes) {
        const oldRate = oldRecipeVariant.resources.get(resource)!;
        const newRate = recipeVariant.resources.get(resource)!;
        if (newRate < oldRate) {
          partlyMoreEfficient = true;
        } else if (oldRate < newRate) {
          moreEfficient = false;
        }
      }
      if (moreEfficient) {
        replaceIndex = i;
      }
      if (!partlyMoreEfficient) {
        shouldPush = false;
      }
    }
    i++;
  }
  if (replaceIndex) {
    recipeVariants[replaceIndex] = recipeVariant;
  } else if (shouldPush) {
    recipeVariants.push(recipeVariant);
  }
};

const setsAreEqual = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((value) => b.has(value));
