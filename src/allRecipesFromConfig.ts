import { Recipe } from "./App";
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

export enum ProducedIn {
  AssemblerMk1 = "ASSEMBLER",
  Blender = "BLENDER",
  ConstructorMk1 = "CONSTRUCTOR",
  FoundryMk1 = "FOUNDRY",
  HadronCollider = "HADRON_COLLIDER",
  ManufacturerMk1 = "MANUFACTURER",
  OilRefinery = "REFINERY",
  Packager = "PACKAGER",
  SmelterMk1 = "SMELTER",
}

const defaultExcludedRecipes = [
  "Alternate_Coal_1", //requires wood
  "Alternate_Coal_2", //requires biomass
  "Alternate_Plastic_1", //to avoid loop
  "Alternate_RecycledRubber", //to avoid loop
  "Alternate_DilutedFuel",
  "Alternate_RocketFuel_Nitro2",
  "Alternate_RocketFuel_Nitro",
];
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
  if (
    [
      "LiquidOil",
      "Water",
      "HeavyOilResidue",
      "LiquidFuel",
      "LiquidTurboFuel",
      "AluminaSolution",
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
    if (recipeName.includes("Unpackage") || !(producedInString in ProducedIn)) {
      continue;
    }
    const producedIn = ProducedIn[producedInString as keyof typeof ProducedIn];
    const splittedProducts = itemClass.mProduct.split("),(");

    const products = splittedProducts.map((product) =>
      getProductAndAmount(product)
    );
    if (products.length === 2) {
      continue;
      /* if (products[0].name !== "Water")
        allRecipes.push({
          recipeName,
          displayName: `${displayName} 1`,
          product: products[0],
          ingredients: [
            ...ingredients,
            { name: products[1].name, amount: -products[1].amount },
          ],
          time,
          producedIn,
        });
      if (
        products[1].name !== "Water" &&
        !(
          recipeName === "UraniumCell" && products[1].name === "SulfuricAcid"
        ) &&
        !defaultExcludedRecipes.includes(recipeName)
      ) {
        allRecipes.push({
          recipeName: `${recipeName}2`,
          displayName: `${displayName} 2`,
          product: products[1],
          ingredients: [
            ...ingredients,
            { name: products[0].name, amount: -products[0].amount },
          ],
          time,
          producedIn,
        });
      } */
    } else if (products.length === 1) {
      allRecipes.push({
        recipeName,
        displayName,
        product: products[0],
        ingredients,
        time,
        isAlternate: recipeName.includes("Alternate_"),
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
export { allRecipes };
