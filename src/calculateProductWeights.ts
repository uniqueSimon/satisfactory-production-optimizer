import { allProducts, allRecipes, Recipe } from "./App";

export const maxRates = new Map([
  ["Coal", 42300],
  ["NitrogenGas", 12000],
  ["OreCopper", 36900],
  ["OreIron", 92100],
  ["RawQuartz", 13500],
  ["Stone", 69300],
  ["Water", Infinity],
  ["LiquidOil", 12600],
  ["OreBauxite", 12300],
  ["OreGold", 15000],
  ["OreUranium", 2100],
  ["SAM", 10200],
  ["Sulfur", 10800],
  ["PolymerResin", 12600 * 6],
]);

export const calculateProductWeights = (excludedResources: string[]) => {
  const weights = new Map<string, { recipeName: string; weight: number }[]>([]);
  maxRates.forEach((value, key) => {
    if (!excludedResources.includes(key)) {
      weights.set(key, [{ recipeName: "mine", weight: 92100 / value }]);
    }
  });
  let didChangeSomething = true;
  while (didChangeSomething) {
    didChangeSomething = false;
    for (const product of allProducts) {
      const recipes = allRecipes.filter((x) => x.product.name === product);
      const existingWeights = weights.get(product) ?? [];
      for (const recipe of recipes) {
        const existingRecipeWeight = existingWeights.find(
          (x) => x.recipeName === recipe.recipeName
        );
        const minRecipeWeight = calculateMinRecipeWeight(recipe, weights);
        if (
          existingRecipeWeight &&
          existingRecipeWeight.weight !== minRecipeWeight
        ) {
          didChangeSomething = true;
          existingRecipeWeight.weight = minRecipeWeight;
        } else if (!existingRecipeWeight) {
          didChangeSomething = true;
          existingWeights.push({
            recipeName: recipe.recipeName,
            weight: minRecipeWeight,
          });
        }
      }
      weights.set(product, existingWeights);
    }
  }
  return weights;
};

const calculateMinRecipeWeight = (
  recipe: Recipe,
  weights: Map<string, { recipeName: string; weight: number }[]>
) => {
  const summedIngredientWeights = recipe.ingredients.reduce(
    (prev, currentIngredient) => {
      const ingredientWeight = weights.get(currentIngredient.name);
      const minimumWeight = ingredientWeight
        ? Math.min(...ingredientWeight.map((x) => x.weight))
        : Infinity;
      const weight = currentIngredient.amount * minimumWeight;
      return weight === -Infinity ? Infinity : prev + weight;
    },
    0
  );
  return summedIngredientWeights / recipe.product.amount;
};
