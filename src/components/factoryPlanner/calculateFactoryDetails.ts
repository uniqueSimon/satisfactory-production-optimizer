import { calculateTreeResults } from "@/calculateTreeResults";
import { SavedFactory } from "./FactoryPlanner";
import { allRecipes } from "@/App";

export const calculateFactoryDetails = (
  savedSettings: SavedFactory[]
): SavedFactory[] =>
  savedSettings.map((setting) => {
    const { productRates } = calculateTreeResults(
      setting.productToProduce,
      setting.wantedOutputRate,
      setting.selectedRecipes,
      allRecipes
    );
    const input = Array.from(productRates)
      .filter(([_, value]) => value.type === "RESOURCE")
      .map(([product, value]) => ({ product, rate: value.rate }));
    return { ...setting, input };
  });
