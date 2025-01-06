import { Recipe } from "../App";
import gameData from "./gameData.json";

interface ItemClass {
  ClassName: string;
  FullName: string;
  mProduct: string;
  mIngredients: string;
  mManufactoringDuration: string;
  mDisplayName: string;
  mProducedIn: string;
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
      /\.(?:Desc|BP)_([A-Za-z_0-9]*)_C'",Amount=(\d+)/.exec(rawIngredients)!;
    const [_, name, rate] = ingredientsMatching;
    ingredients.push({ name, amount: convertRateUnits(name, +rate) });
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
const recipeNativeClass = (gameData as any[]).find(
  (x) =>
    x.NativeClass === "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'"
);
for (const item of recipeNativeClass!.Classes) {
  const itemClass = item as ItemClass;
  const recipeName = itemClass.ClassName.split("_").slice(1, -1).join("_");
  const displayName = itemClass.mDisplayName;
  const fullName = itemClass.FullName;
  const categoryMatching =
    /BlueprintGeneratedClass \/Game\/FactoryGame\/Recipes\/(.*)/.exec(fullName);
  if (
    categoryMatching &&
    !categoryMatching[1].includes("Buildings") &&
    !categoryMatching[1].includes("Equipment") &&
    !categoryMatching[1].includes("Converter") &&
    !categoryMatching[1].includes("Vehicle")
  ) {
    const ingredients = getIngredients(itemClass.mIngredients);
    const time = +itemClass.mManufactoringDuration;
    const producedInString = itemClass.mProducedIn.split("/")[5];
    const producedIn = producedInString;
    const splittedProducts = itemClass.mProduct.split("),(");

    const products = splittedProducts.map((product) =>
      getProductAndAmount(product)
    );
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
        isAlternate:
          recipeName.includes("Alternate_") || recipeName.includes("Residual"),
        producedIn,
      });
      allRecipes.push({
        recipeName: `${recipeName}2`,
        displayName: `${displayName} 2`,
        product: products[1],
        ingredients: [
          ...ingredients,
          { name: products[0].name, amount: -products[0].amount },
        ],
        time,
        isAlternate:
          recipeName.includes("Alternate_") || recipeName.includes("Residual"),
        producedIn,
      });
    } else if (products.length === 1) {
      allRecipes.push({
        recipeName,
        displayName,
        product: products[0],
        ingredients,
        time,
        isAlternate:
          recipeName.includes("Alternate_") || recipeName.includes("Residual"),
        producedIn,
      });
    } else {
      console.warn("Error: Unknown product count", products);
    }
  }
}
/* allRecipes.push({
  recipeName: "EfficientPlastic",
  displayName: "Efficient Plastic",
  product: { name: "Plastic", amount: 9 },
  ingredients: [
    { name: "LiquidOil", amount: 3 },
    { name: "Water", amount: 10 },
  ],
  time: 9,
  producedIn: "CUSTOM",
});
allRecipes.push({
  recipeName: "EfficientRubber",
  displayName: "Efficient Rubber",
  product: { name: "Rubber", amount: 9 },
  ingredients: [
    { name: "LiquidOil", amount: 3 },
    { name: "Water", amount: 10 },
  ],
  time: 9,
  producedIn: "CUSTOM",
}); */

const allProductsSet = new Set<string>();
for (const recipe of allRecipes) {
  allProductsSet.add(recipe.product.name);
}
const allProducts = [...allProductsSet];

export { allRecipes, allProducts };
