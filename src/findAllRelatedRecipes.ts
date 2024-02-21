import { Recipe } from "./App";

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

export const findAllRelatedRecipesAndProducts = (
  product: string,
  recipes: Recipe[]
) => {
  const usedRecipes: Recipe[] = [];
  const usedProducts: string[] = [];
  const recursion = (product: string) => {
    if (usedProducts.includes(product)) {
      return;
    }
    const viableRecipes = recipes.filter(
      (x) =>
        x.productName === product &&
        x.ingredients.every((x) => !notWantedProducts.includes(x.name)) &&
        !notWantedRecipes.includes(x.recipeName)
    );
    if (viableRecipes.length === 0) {
      console.log("no recipe for", product);
    } else {
      usedProducts.push(product);
    }
    for (const recipe of viableRecipes) {
      usedRecipes.push(recipe);
      for (const ingredient of recipe.ingredients) {
        recursion(ingredient.name);
      }
    }
  };
  recursion(product);
  return { usedRecipes, usedProducts };
};
