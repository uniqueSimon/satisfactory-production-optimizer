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
  PolymerResin = WeightingFactor.LiquidOil / 3 / 2,
}

export const buildTree = (product: string, rate: number, recipes: Recipe[]) => {
  const viableRecipes = recipes.filter((x) => x.products[0].name === product);
  if (!viableRecipes.length || rate < 0) {
    const weightingFactor =
      product in WeightingFactor
        ? WeightingFactor[product as keyof typeof WeightingFactor]
        : 100;
    if (weightingFactor === 100) {
      console.log(`No weight for ${product}`);
    }
    return {
      recipeTree: [] as Tree[],
      weightedPoints: rate * weightingFactor,
    };
  }
  let minWeightedPoints = Infinity;
  const ret = viableRecipes.map((recipe) => {
    const recipeTree: Tree = {
      recipeName: recipe.recipeName,
      numberOfMachines: rate / ((recipe.products[0].amount / recipe.time) * 60),
      ingredients: [],
    };
    let summedWeightedPoints = 0;
    for (const ingredient of recipe.ingredients) {
      const ingredientRate =
        (ingredient.amount / recipe.products[0].amount) * rate;
      const ingredientTree = buildTree(
        ingredient.name,
        ingredientRate,
        recipes
      );
      recipeTree.ingredients.push({
        product: ingredient.name,
        rate: ingredientRate,
        ingredientTree: ingredientTree.recipeTree,
        weightedPoints: ingredientTree.weightedPoints,
      });
      summedWeightedPoints += ingredientTree.weightedPoints;
    }
    if (recipe.products[1]) {
      const byProductRate =
        -(recipe.products[1].amount / recipe.products[0].amount) * rate;
      const byProductTree = buildTree(
        recipe.products[1].name,
        byProductRate,
        recipes
      );
      recipeTree.ingredients.push({
        product: recipe.products[1].name,
        rate: byProductRate,
        ingredientTree: byProductTree.recipeTree,
        weightedPoints: byProductTree.weightedPoints,
      });
      summedWeightedPoints += byProductTree.weightedPoints;
    }
    if (summedWeightedPoints < minWeightedPoints) {
      minWeightedPoints = summedWeightedPoints;
    }
    return recipeTree;
  });
  return { recipeTree: ret, weightedPoints: minWeightedPoints };
};
