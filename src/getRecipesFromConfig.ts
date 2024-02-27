import { Recipe } from "./App";
import gameData from "./gameData.json";

interface ItemClass {
  ClassName: string;
  FullName: string;
  mProduct: string;
  mIngredients: string;
  mManufactoringDuration: string;
  mDisplayName: string;
}

const oilRecipes = [
  "Plastic",
  "Rubber",
  "ResidualPlastic",
  "ResidualRubber",
  "LiquidFuel",
  "Alternate_PolymerResin",
  "Alternate_HeavyOilResidue",
];

export const getRecipesFromConfig = () => {
  const ret: Recipe[] = [];
  const recipeNativeClass = gameData.find(
    (x) =>
      x.NativeClass ===
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'"
  );
  for (const item of recipeNativeClass!.Classes) {
    const itemClass = item as ItemClass;
    const recipeName = itemClass.ClassName.split("_").slice(1, -1).join("_");
    const displayName = itemClass.mDisplayName;
    const fullName = itemClass.FullName;
    const categoryMatching =
      /BlueprintGeneratedClass \/Game\/FactoryGame\/Recipes\/(.*)/.exec(
        fullName
      );
    if (
      categoryMatching &&
      !categoryMatching[1].includes("Buildings") &&
      !categoryMatching[1].includes("Equipment") &&
      !categoryMatching[1].includes("Vehicle")
    ) {
      const ingredients = getIngredients(itemClass.mIngredients);
      const time = +itemClass.mManufactoringDuration;
      if (itemClass.mProduct.includes("),(")) {
        if (!recipeName.includes("Unpackage")) {
          const splittedProducts = itemClass.mProduct.split("),(");
          const multipleProducts = splittedProducts.map((product) =>
            getProductAndAmount(product)
          );
          const byProductIndex = multipleProducts.findIndex((x) =>
            [
              "Water",
              "LiquidFuel",
              "HeavyOilResidue",
              "SulfuricAcid",
              "AluminaSolution",
            ].includes(x.productName)
          );
          if (byProductIndex === -1) {
            console.log(
              "No byproduct found for",
              displayName,
              multipleProducts.map((x) => x.productName),
              ingredients.map((x) => x.name)
            );
            continue;
          }
          const byProduct = multipleProducts[byProductIndex];
          const mainProduct = multipleProducts[byProductIndex === 0 ? 1 : 0];
          if (!oilRecipes.includes(recipeName)) {
            ret.push({
              recipeName,
              displayName: `${displayName} (By-product ${byProduct.productName})`,
              productName: mainProduct.productName,
              productAmount: mainProduct.productAmount,
              ingredients,
              time,
            });
          }
        }
      } else {
        const { productName, productAmount } = getProductAndAmount(
          itemClass.mProduct
        );
        if (!oilRecipes.includes(recipeName)) {
          ret.push({
            recipeName,
            displayName,
            productName,
            productAmount,
            ingredients,
            time,
          });
        }
      }
    }
  }
  ret.push({
    recipeName: "EfficientPlastic",
    displayName: "Efficient Plastic",
    productName: "Plastic",
    productAmount: 3,
    ingredients: [{ name: "LiquidOil", amount: 1 }],
    time: 1,
  });
  ret.push({
    recipeName: "EfficientRubber",
    displayName: "Efficient Rubber",
    productName: "Rubber",
    productAmount: 3,
    ingredients: [{ name: "LiquidOil", amount: 1 }],
    time: 1,
  });
  ret.push({
    recipeName: "EfficientHeavyOilResidue",
    displayName: "Efficient Heavy Oil Residue",
    productName: "HeavyOilResidue",
    productAmount: 6,
    ingredients: [{ name: "LiquidOil", amount: 1 }],
    time: 1,
  });
  return ret;
};

const getProductAndAmount = (rawString: string) => {
  const prodMatching =
    /BlueprintGeneratedClass.*\.(?:Desc|BP)_(.*)_C"',Amount=(\d+)/.exec(
      rawString
    )!;
  const [_, productName, rate] = prodMatching;
  return { productName, productAmount: convertRateUnits(productName, +rate) };
};

const getIngredients = (rawString: string) => {
  const splittedIngredients = rawString.split("),(");
  const ingredients: { name: string; amount: number }[] = [];
  for (const rawIngredients of splittedIngredients) {
    const ingredientsMatching =
      /\.(?:Desc|BP)_([A-Za-z_0-9]*)_C"',Amount=(\d+)/.exec(rawIngredients)!;
    const [_, name, rate] = ingredientsMatching;
    ingredients.push({ name, amount: convertRateUnits(name, +rate) });
  }
  return ingredients;
};

const convertRateUnits = (productName: string, rate: number) => {
  if (["LiquidOil", "Water", "HeavyOilResidue"].includes(productName)) {
    return rate / 1000;
  }
  return rate;
};
