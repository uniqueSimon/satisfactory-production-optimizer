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

const notWantedRecipesBasic = [
  "Alternate_RecycledRubber",
  "Alternate_Plastic_1",
  "ResidualPlastic",
  "PetroleumCoke",
];
const notWantedProducts = [
  "GenericBiomass",
  "Wood",
  "NitrogenGas",
  "NuclearWaste",
  "AluminumScrap",
  "AluminaSolution",
  "AluminumIngot",
  "AluminumCasing",
  "OreUranium",
];

//should go through recipe tree and find all potential recipes and products
export const recipeTreeSearch = (
  outputProduct: string,
  inputProducts: string[],
  recipes: Recipe[],
  onlyOneVariantPerResourceTypes: boolean
) => {
  let tooManyVariants = false;
  const recursion = (product: string): RecipeVariant[] | null => {
    if (inputProducts.includes(product)) {
      return [
        {
          resourceTypes: new Set([product]),
          resources: new Map([[product, 1]]),
          details: [{ product: product, rate: 1, recipeNames: [] }],
        },
      ];
    }
    const viableRecipes = recipes.filter(
      (x) =>
        x.productName === product &&
        x.ingredients.every((x) => !notWantedProducts.includes(x.name)) &&
        !notWantedRecipesBasic.includes(x.recipeName)
    );
    if (viableRecipes.length === 0) {
      return null;
    }
    const recipeVariants: RecipeVariant[] = [];
    for (const recipe of viableRecipes) {
      const concatenatedIngredients: RecipeVariant[][] = [];
      let ingredientCannotBeProduced = false;
      for (const ingredient of recipe.ingredients) {
        const ingredienteRate = ingredient.amount / recipe.productAmount;
        const ingredientResultNormalized = recursion(ingredient.name);
        if (ingredientResultNormalized) {
          const ingredientResult = ingredientResultNormalized.map((y) => {
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
          concatenatedIngredients.push(ingredientResult);
        } else {
          ingredientCannotBeProduced = true;
          break;
        }
      }
      if (ingredientCannotBeProduced) {
        continue;
      }
      const combinations = generateCombinations(
        concatenatedIngredients.map((x) => x.length)
      );
      for (const combination of combinations) {
        const recipeVariant = calculateRecipeVariant(
          concatenatedIngredients,
          combination,
          recipe
        );
        recipeVariants.push(recipeVariant);
      }
    }
    if (!onlyOneVariantPerResourceTypes && recipeVariants.length > 300) {
      tooManyVariants = true;
      return filterOutInefficientVariants(recipeVariants);
    }
    if (onlyOneVariantPerResourceTypes) {
      return filterOutInefficientVariants(recipeVariants);
    }
    return recipeVariants;
  };
  return { recipeVariants: recursion(outputProduct), tooManyVariants };
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
