import { Recipe, Tree } from "./App";

enum WeightingFactor {
  OreIron = 1 / 7.038,
  Water = 0,
  LiquidOil = 1 / 1.17,
  Coal = 1 / 3.012,
  Stone = 1 / 5.286,
  OreCopper = 1 / 2.886,
  Sulfur = 1 / 0.684,
  OreGold = 1 / 1.104,
  OreBauxite = 1 / 0.978,
  RawQuartz = 1 / 1.05,
  OreUranium = 1 / 0.21,
  PolymerResin = (1 / 6) * WeightingFactor.LiquidOil,
  HeavyOilResidue = (2 / 3) * WeightingFactor.LiquidOil,
  LiquidFuel = (1 / 3) * WeightingFactor.LiquidOil,
  Plastic = (1 / 3) * WeightingFactor.LiquidOil,
  Rubber = (1 / 3) * WeightingFactor.LiquidOil,
  Silica = (3 * WeightingFactor.RawQuartz + 5 * WeightingFactor.Stone) / 7,
  AluminaSolution = (12 * WeightingFactor.OreBauxite -
    5 * WeightingFactor.Silica) /
    12,
}

export const buildTree = (
  product: string,
  rate: number,
  recipes: Recipe[],
  inputProducts: string[],
  allRelevantRecipes: Recipe[]
): {
  recipeTree: Tree[];
  weightedPoints: number;
} => {
  if (inputProducts.includes(product)) {
    const { weightedPoints } = buildTree(
      product,
      rate,
      allRelevantRecipes,
      [],
      allRelevantRecipes
    );
    return {
      recipeTree: [] as Tree[],
      weightedPoints,
    };
  }
  const viableRecipes = recipes.filter((x) => x.product.name === product);
  if (!viableRecipes.length || rate < 0) {
    if (!(product in WeightingFactor) && recipes.length > 0) {
      //Initially recipes is empty. Do not throw this warning in that case
      console.warn(`No weight for ${product}`);
      return {
        recipeTree: [] as Tree[],
        weightedPoints: rate,
      };
    }
    const weightingFactor =
      WeightingFactor[product as keyof typeof WeightingFactor];
    return {
      recipeTree: [] as Tree[],
      weightedPoints: rate * weightingFactor,
    };
  }
  let minWeightedPoints = Infinity;
  let minWeightedPointsIndex = -1;
  const ret: Tree[] = [];
  viableRecipes.forEach((recipe, i) => {
    const recipeTree: Tree = {
      recipeName: recipe.recipeName,
      numberOfMachines: rate / ((recipe.product.amount / recipe.time) * 60),
      ingredients: [],
      isBestRecipe: false,
    };
    let summedWeightedPoints = 0;
    for (const ingredient of recipe.ingredients) {
      const ingredientRate = (ingredient.amount / recipe.product.amount) * rate;
      const ingredientTree = buildTree(
        ingredient.name,
        ingredientRate,
        recipes,
        inputProducts,
        allRelevantRecipes
      );
      recipeTree.ingredients.push({
        product: ingredient.name,
        rate: ingredientRate,
        ingredientTree: ingredientTree.recipeTree,
        weightedPoints: ingredientTree.weightedPoints,
      });
      summedWeightedPoints += ingredientTree.weightedPoints;
    }
    if (summedWeightedPoints < minWeightedPoints) {
      minWeightedPoints = summedWeightedPoints;
      minWeightedPointsIndex = i;
    }
    ret.push(recipeTree);
  });
  ret[minWeightedPointsIndex].isBestRecipe = true;
  return { recipeTree: ret, weightedPoints: minWeightedPoints };
};
