import fs from "fs";
import gameData from "./gameData.json";

interface ItemClass {
  ClassName: string;
  mDisplayName: string;
}

const productDisplayNameMapping = new Map<string, string>();
const recipeNativeClasses = gameData as any[];
for (const recipeNativeClass of recipeNativeClasses) {
  for (const item of recipeNativeClass!.Classes) {
    const itemClass = item as ItemClass;
    const productName = itemClass.ClassName.split("_").slice(1, -1).join("_");
    const displayName = itemClass.mDisplayName;
    productDisplayNameMapping.set(productName, displayName);
  }
}
export const displayNames = [...productDisplayNameMapping.entries()];
