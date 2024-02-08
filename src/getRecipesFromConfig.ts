// @ts-nocheck
import { Recipe } from "./App";
import gameData from "./gameData.json";

export const getRecipesFromConfig = () => {
  const ret: Recipe[] = [];
  for (const item of gameData) {
    if (
      item.NativeClass ===
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'"
    ) {
      for (const itemClass of item.Classes) {
        const className = itemClass.ClassName;
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
          const prodMatching =
            /BlueprintGeneratedClass.*\.(.*)"',Amount=(\d+)/.exec(
              itemClass.mProduct
            );
          const splittedIngredients = itemClass.mIngredients.split("),(");
          const ingredients: { name: string; amount: number }[] = [];
          for (const rawIngredients of splittedIngredients) {
            const ingredientsMatching = /\.([A-Za-z_0-9]*)"',Amount=(\d+)/.exec(
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
            className,
            productName,
            productAmount,
            ingredients,
            time,
          });
        }
      }
    }
  }
  return ret;
};
