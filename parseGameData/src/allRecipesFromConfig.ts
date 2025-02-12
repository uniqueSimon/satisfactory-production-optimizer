import gameData from "./gameData.json";
import fs from "fs";
import { recipeSchematicMapping } from "./recipeSchematicMapping";

export interface Recipe {
  recipeName: string;
  displayName: string;
  product: { name: string; amount: number };
  ingredients: { name: string; amount: number }[];
  time: number;
  isAlternate: boolean;
  producedIn: string;
  tier: number;
}

export interface FGRecipe {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'";
  Classes: {
    ClassName: string;
    FullName: string;
    mProduct: string;
    mIngredients: string;
    mManufactoringDuration: string;
    mDisplayName: string;
    mProducedIn: string;
  }[];
}
export interface Schematic {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic'";
  Classes: {
    ClassName: string;
    mDisplayName: string;
    FullName: string;
    mType: "EST_Custom" | "EST_Alternate";
    mTechTier: string;
    mUnlocks: { Class: "BP_UnlockRecipe_C"; mRecipes: string }[];
  }[];
}

const getProductAndAmount = (rawString: string) => {
  const prodMatching =
    /BlueprintGeneratedClass.*\.(?:Desc|BP)_(.*)_C'",Amount=(\d+)/.exec(
      rawString
    )!;
  const [_, name, originalAmount] = prodMatching;
  return { name, amount: convertRateUnits(name, +originalAmount) };
};

const getIngredients = (rawString: string) => {
  const splittedIngredients = rawString.split("),(");
  const ingredients: { name: string; amount: number }[] = [];
  for (const rawIngredients of splittedIngredients) {
    const ingredientsMatching =
      /\.(?:Desc|BP)_([A-Za-z_0-9]*)_C'",Amount=(\d+)/.exec(rawIngredients);
    if (ingredientsMatching) {
      const [_, name, rate] = ingredientsMatching;
      ingredients.push({ name, amount: convertRateUnits(name, +rate) });
    }
  }
  return ingredients;
};

const convertRateUnits = (productName: string, rate: number) => {
  //liquids
  if (
    [
      "LiquidOil",
      "Water",
      "HeavyOilResidue",
      "LiquidFuel",
      "LiquidTurboFuel",
      "AluminaSolution",
      "SulfuricAcid",
      "NitricAcid",
      "NitrogenGas",
    ].includes(productName)
  ) {
    return rate / 1000;
  }
  return rate;
};
const allRecipes: Recipe[] = [];
const recipeNativeClass = (gameData as unknown as [Schematic, FGRecipe]).find(
  (x) =>
    x.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'"
) as FGRecipe;
for (const item of recipeNativeClass!.Classes) {
  const recipeName = item.ClassName.split("_").slice(1, -1).join("_");
  const displayName = item.mDisplayName;
  const fullName = item.FullName;
  const categoryMatching =
    /BlueprintGeneratedClass \/Game\/FactoryGame\/Recipes\/(.*)/.exec(fullName);
  if (
    categoryMatching &&
    !categoryMatching[1].includes("Buildings") &&
    !categoryMatching[1].includes("Equipment") &&
    !categoryMatching[1].includes("Vehicle")
  ) {
    const ingredients = getIngredients(item.mIngredients);
    const time = +item.mManufactoringDuration;
    const producedInString = item.mProducedIn.split("/")[5];
    const producedIn = producedInString;
    const splittedProducts = item.mProduct.split("),(");

    const products = splittedProducts.map((product) =>
      getProductAndAmount(product)
    );
    const schematic = recipeSchematicMapping.get(recipeName)!;
    if (products.length === 2) {
      allRecipes.push({
        recipeName,
        displayName,
        product: products[0],
        ingredients: [
          ...ingredients,
          { name: products[1].name, amount: -products[1].amount },
        ],
        time,
        producedIn,
        tier: schematic.tier,
        isAlternate: schematic.isAlternate,
      });
    } else if (products.length === 1) {
      allRecipes.push({
        recipeName,
        displayName,
        product: products[0],
        ingredients,
        time,
        producedIn,
        tier: schematic.tier,
        isAlternate: schematic.isAlternate,
      });
    } else {
      console.warn("Error: Unknown product count", products);
    }
  }
}
const allProductsSet = new Set<string>();
for (const recipe of allRecipes) {
  allProductsSet.add(recipe.product.name);
}
const allProducts = [...allProductsSet];

export { allRecipes, allProducts };
