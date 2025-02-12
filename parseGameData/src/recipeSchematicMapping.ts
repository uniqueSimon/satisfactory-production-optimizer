import fs from "fs";
import { FGRecipe, Schematic } from "./allRecipesFromConfig";
import gameData from "./gameData.json";

const schematics = (gameData as unknown as [Schematic, FGRecipe]).find(
  (x) =>
    x.NativeClass ===
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic'"
) as Schematic;
export const recipeSchematicMapping = new Map<
  string,
  { tier: number; isAlternate: boolean }
>();
for (const item of schematics!.Classes) {
  const unlockedRecipes = item.mUnlocks.filter(
    (x) => x.Class === "BP_UnlockRecipe_C"
  );
  for (const entry of unlockedRecipes) {
    const splittedRecipes = entry.mRecipes.split(",");
    for (const splitted of splittedRecipes) {
      const matching = /\.Recipe_(.*)_C/.exec(splitted);
      const recipe = matching?.[1];
      if (recipe) {
        const existing = recipeSchematicMapping.get(recipe);
        //if there is a recipe without "EST_Alternate", i don't consider it as alternate.
        if (!existing) {
          recipeSchematicMapping.set(recipe, {
            tier: +item.mTechTier,
            isAlternate: item.mType === "EST_Alternate",
          });
        } else if (existing.isAlternate && item.mType !== "EST_Alternate") {
          recipeSchematicMapping.set(recipe, {
            tier: +item.mTechTier,
            isAlternate: false,
          });
        }
      }
    }
  }
}
