import { Recipe } from "./App";

export interface RecipeVariant {
  resourceTypes: Set<string>;
  resources: Map<string, number>;
  usedRecipes: Set<string>;
}

const notWantedRecipes = [
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
  onlyOneVariantPerResourceTypes: boolean,
  wantedOutputRate: number
) => {
  let tooManyVariants = false;
  const recursion = (product: string): RecipeVariant[] | null => {
    if (inputProducts.includes(product)) {
      return [
        {
          resourceTypes: new Set([product]),
          resources: new Map([[product, 1]]),
          usedRecipes: new Set(),
        },
      ];
    }
    const viableRecipes = recipes.filter(
      (x) =>
        x.productName === product &&
        x.ingredients.every((x) => !notWantedProducts.includes(x.name)) &&
        !notWantedRecipes.includes(x.recipeName)
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
            return {
              resourceTypes: y.resourceTypes,
              usedRecipes: y.usedRecipes,
              resources,
            };
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
          recipe.recipeName
        );
        recipeVariants.push(recipeVariant);
      }
    }
    if (!onlyOneVariantPerResourceTypes && recipeVariants.length > 100) {
      tooManyVariants = true;
      return recipeVariants.slice(0, 100);
    }
    if (onlyOneVariantPerResourceTypes) {
      return filterOutInefficientVariants(recipeVariants);
    }
    return recipeVariants;
  };
  const recipeVariantsNormalized = recursion(outputProduct);
  const recipeVariants = recipeVariantsNormalized
    ? recipeVariantsNormalized.map((y) => {
        const resources = new Map<string, number>();
        y.resources.forEach((rate, resource) => {
          resources.set(resource, rate * wantedOutputRate);
        });
        return {
          resourceTypes: y.resourceTypes,
          usedRecipes: y.usedRecipes,
          resources,
        };
      })
    : [];
  return { recipeVariants, tooManyVariants };
};

const generateCombinations = (lastCombination: number[]) => {
  const allCombinations: number[][] = [];

  const generateCombinationsRecursion = (currentCombination: number[] = []) => {
    if (currentCombination.length === lastCombination.length) {
      allCombinations.push(currentCombination);
      return;
    }
    const maxValueOfDigit = lastCombination[currentCombination.length];
    for (let digit = 0; digit < maxValueOfDigit; digit++) {
      generateCombinationsRecursion([...currentCombination, digit]);
    }
  };
  generateCombinationsRecursion();
  return allCombinations;
};

const calculateRecipeVariant = (
  ingredients: RecipeVariant[][],
  combination: number[],
  recipeName: string
): RecipeVariant => {
  const resources = new Map<string, number>();
  const usedRecipes = new Set<string>();
  const resourceTypes = new Set<string>();
  for (const ingredientIndex in combination) {
    const variant = combination[ingredientIndex];
    const ingredientVariant = ingredients[ingredientIndex][variant];
    ingredientVariant.usedRecipes.forEach((x) => usedRecipes.add(x));
    usedRecipes.add(recipeName);
    ingredientVariant.resources.forEach((rate, resource) => {
      const oldRate = resources.get(resource);
      resources.set(resource, (oldRate ?? 0) + rate);
    });
    ingredientVariant.resourceTypes.forEach((x) => resourceTypes.add(x));
  }
  return { resources, usedRecipes, resourceTypes };
};

const filterOutInefficientVariants = (recipeVariants: RecipeVariant[]) => {
  const groupedByResourceTypes = new Map<string, RecipeVariant>();
  for (const recipeVariant of recipeVariants) {
    const key = Array.from(recipeVariant.resourceTypes).sort().join(",");
    const existing = groupedByResourceTypes.get(key);
    if (existing) {
      const oldTotalRate = [...existing.resources.values()].reduce(
        (acc, x) => acc + x,
        0
      );
      const newTotalRate = [...recipeVariant.resources.values()].reduce(
        (acc, x) => acc + x,
        0
      );
      if (newTotalRate < oldTotalRate) {
        groupedByResourceTypes.set(key, recipeVariant);
      }
    } else {
      groupedByResourceTypes.set(key, recipeVariant);
    }
  }
  return Array.from(groupedByResourceTypes.values());
};
