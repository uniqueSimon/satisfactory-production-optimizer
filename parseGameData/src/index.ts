import fs from "fs";
import { allProducts, allRecipes } from "./allRecipesFromConfig";
import { displayNames } from "./getProductDisplayNames";

fs.writeFileSync("../src/gameData/allRecipes.json", JSON.stringify(allRecipes));
fs.writeFileSync("../src/gameData/allProducts.json", JSON.stringify(allProducts));
fs.writeFileSync(
  "../src/gameData/displayNames.json",
  JSON.stringify(displayNames)
);
