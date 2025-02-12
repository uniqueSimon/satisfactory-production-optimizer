import fs from "fs";
import { allProducts, allRecipes } from "./allRecipesFromConfig";
import { displayNames } from "./getProductDisplayNames";

fs.writeFileSync(
  "../public/gameData/allRecipes.json",
  JSON.stringify(allRecipes)
);
fs.writeFileSync(
  "../public/gameData/allProducts.json",
  JSON.stringify(allProducts)
);
fs.writeFileSync(
  "../public/gameData/displayNames.json",
  JSON.stringify(displayNames)
);
