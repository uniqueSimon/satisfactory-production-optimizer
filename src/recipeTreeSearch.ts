import { Recipe } from "./App";

export interface RecipeVariant {
  resourceTypes: Set<string>;
  resources: Map<string, number>;
  usedRecipes: Map<string, number>;
}

//should go through recipe tree and find all potential recipes and products
export const recipeTreeSearch = (
  outputProduct: string,
  inputProducts: string[],
  recipes: Recipe[],
  onlyOneVariantPerResourceTypes: boolean,
  wantedOutputRate: number
) => {
  const recursion = (product: string): RecipeVariant[] => {
    if (inputProducts.includes(product)) {
      return [
        {
          resourceTypes: new Set([product]),
          resources: new Map([[product, 1]]),
          usedRecipes: new Map(),
        },
      ];
    }
    const viableRecipes = recipes.filter((x) => x.products[0].name === product);
    const recipeVariants: RecipeVariant[] = getRecipeVariants(
      viableRecipes,
      recursion
    );
    return onlyOneVariantPerResourceTypes
      ? filterOutInefficientVariants(recipeVariants).slice(0, 50)
      : recipeVariants.slice(0, 100);
  };
  const recipeVariantsNormalized = recursion(outputProduct);
  const recipeVariants = scaleRecipeVariants(
    recipeVariantsNormalized,
    wantedOutputRate
  );
  replaceUsedRecipes(recipeVariants);
  return recipeVariants;
};

const replaceUsedRecipes = (recipeVariants: RecipeVariant[]) => {
  recipeVariants.map((recipeVariant) => {
    const usedRecipes = recipeVariant.usedRecipes;
    const efficientPlastic = usedRecipes.get("EfficientPlastic");
    if (efficientPlastic) {
      usedRecipes.set("Alternate_Plastic_1", efficientPlastic * 1.26);
      usedRecipes.set("Alternate_RecycledRubber", efficientPlastic * 0.52);
      usedRecipes.set("ResidualRubber", efficientPlastic * 0.33);
      usedRecipes.set("Alternate_DilutedFuel", efficientPlastic * 0.53);
      usedRecipes.set("Alternate_HeavyOilResidue", efficientPlastic * 0.67);
      usedRecipes.delete("EfficientPlastic");
    }
    const efficientRubber = usedRecipes.get("EfficientRubber");
    if (efficientRubber) {
      usedRecipes.set("Alternate_Plastic_1", efficientRubber * 0.59);
      usedRecipes.set("Alternate_RecycledRubber", efficientRubber * 1.19);
      usedRecipes.set("ResidualRubber", efficientRubber * 0.33);
      usedRecipes.set("Alternate_DilutedFuel", efficientRubber * 0.53);
      usedRecipes.set("Alternate_HeavyOilResidue", efficientRubber * 0.67);
      usedRecipes.delete("EfficientPlastic");
    }
  });
};

const getRecipeVariants = (
  viableRecipes: Recipe[],
  getIngredientVariants: (product: string) => RecipeVariant[]
) => {
  const recipeVariants: RecipeVariant[] = [];
  for (const recipe of viableRecipes) {
    const concatenatedIngredients = getConcatedIngredients(
      recipe,
      getIngredientVariants
    );
    if (concatenatedIngredients) {
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
  }
  return recipeVariants;
};

const getConcatedIngredients = (
  recipe: Recipe,
  getIngredientVariants: (product: string) => RecipeVariant[]
) => {
  const concatenatedIngredients: RecipeVariant[][] = [];
  for (const ingredient of recipe.ingredients) {
    const scalingFactor = ingredient.amount / recipe.products[0].amount;
    const ingredientResultNormalized = getIngredientVariants(ingredient.name);
    if (!ingredientResultNormalized.length) {
      return null;
    }
    const ingredientResult = scaleRecipeVariants(
      ingredientResultNormalized,
      scalingFactor
    );
    concatenatedIngredients.push(ingredientResult);
  }
  return concatenatedIngredients;
};

const scaleRecipeVariants = (
  normalized: RecipeVariant[],
  scalingFactor: number
): RecipeVariant[] => {
  const ret = normalized.map((y) => {
    const resources = new Map<string, number>();
    y.resources.forEach((rate, resource) => {
      resources.set(resource, rate * scalingFactor);
    });
    const usedRecipes = new Map<string, number>();
    y.usedRecipes.forEach((number, recipe) => {
      usedRecipes.set(recipe, number * scalingFactor);
    });
    return {
      resourceTypes: y.resourceTypes,
      usedRecipes,
      resources,
    };
  });
  return ret;
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
  recipe: Recipe
): RecipeVariant => {
  const resources = new Map<string, number>();
  const usedRecipes = new Map<string, number>();
  const resourceTypes = new Set<string>();
  for (const ingredientIndex in combination) {
    const variant = combination[ingredientIndex];
    const ingredientVariant = ingredients[ingredientIndex][variant];
    ingredientVariant.usedRecipes.forEach((number, recipeName) => {
      const existing = usedRecipes.get(recipeName);
      usedRecipes.set(recipeName, (existing ?? 0) + number);
    });
    ingredientVariant.resources.forEach((rate, resource) => {
      const oldRate = resources.get(resource);
      resources.set(resource, (oldRate ?? 0) + rate);
    });
    ingredientVariant.resourceTypes.forEach((x) => resourceTypes.add(x));
  }
  const existing = usedRecipes.get(recipe.recipeName);
  const productionRate = (recipe.products[0].amount / recipe.time) * 60;
  usedRecipes.set(recipe.recipeName, (existing ?? 0) + 1 / productionRate);
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
