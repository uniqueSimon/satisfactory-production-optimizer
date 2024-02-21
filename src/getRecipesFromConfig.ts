// @ts-nocheck
import { Recipe } from "./App";
import gameData from "./gameData.json";

export const getRecipesFromConfig = () => {
  const ret: Recipe[] = [];
  const recipeNativeClass = gameData.find(
    (x) =>
      x.NativeClass ===
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'"
  );
  for (const itemClass of recipeNativeClass.Classes) {
    const recipeName = itemClass.ClassName.split("_").slice(1, -1).join("_");
    const fullName = itemClass.FullName;
    const categoryMatching =
      /BlueprintGeneratedClass \/Game\/FactoryGame\/Recipes\/(.*)/.exec(
        fullName
      );
    if (
      categoryMatching &&
      !categoryMatching[1].includes("Buildings") &&
      !categoryMatching[1].includes("Equipment") &&
      !categoryMatching[1].includes("SpaceElevatorParts") &&
      !categoryMatching[1].includes("Vehicle")
    ) {
      if (itemClass.mProduct.includes("),(")) {
        //console.log("invalid recipe", recipeName, itemClass.mProduct);
      } else {
        const prodMatching =
          /BlueprintGeneratedClass.*\.(?:Desc|BP)_(.*)_C"',Amount=(\d+)/.exec(
            itemClass.mProduct
          );
        const splittedIngredients = itemClass.mIngredients.split("),(");
        const ingredients: { name: string; amount: number }[] = [];
        for (const rawIngredients of splittedIngredients) {
          const ingredientsMatching =
            /\.(?:Desc|BP)_([A-Za-z_0-9]*)_C"',Amount=(\d+)/.exec(
              rawIngredients
            );
          ingredients.push({
            name: ingredientsMatching![1],
            amount: +ingredientsMatching![2],
          });
        }
        const productName = prodMatching![1];
        const productAmount = +prodMatching![2];
        const time = +itemClass.mManufactoringDuration;
        ret.push({
          recipeName,
          productName,
          productAmount,
          ingredients,
          time,
        });
      }
    }
  }
  return ret;
};
