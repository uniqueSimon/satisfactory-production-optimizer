import { calculateTreeResults } from "@/calculateTreeResults";
import { SavedSetting } from "./FactoryPlanner";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";

export interface FactoryDetails {
  timestamp: number;
  productRates: Map<
    string,
    {
      rate: number;
      type?: "RESOURCE" | "MULTIPLE";
    }
  >;
  machines: Map<string, number>;
  output: { product: string; rate: number };
  input: { product: string; rate: number }[];
  targetFactories: {
    timestamp: number;
    product: string;
    rate: number;
  }[];
  sourceFactories: {
    timestamp: number;
    product: string;
    rate: number;
  }[];
}

export const calculateFactoryDetails = (savedSettings: SavedSetting[]) => {
  const factoryDetails: FactoryDetails[] = [];
  savedSettings.forEach((setting) => {
    const { productRates, machines } = calculateTreeResults(
      setting.productToProduce,
      setting.wantedOutputRate,
      setting.selectedRecipes,
      allRecipes
    );
    const input: { product: string; rate: number }[] = [];
    productRates.forEach((value, product) => {
      if (value.type === "RESOURCE") {
        input.push({ product, rate: value.rate });
      }
    });
    factoryDetails.push({
      timestamp: setting.timestamp,
      productRates,
      machines,
      output: {
        product: setting.productToProduce,
        rate: setting.wantedOutputRate,
      },
      input,
      sourceFactories: [],
      targetFactories: [],
    });
  });
  calculateFactoryRelationships(factoryDetails);
  return factoryDetails;
};

const calculateFactoryRelationships = (factoryDetails: FactoryDetails[]) => {
  for (const currentFactory of factoryDetails) {
    for (const otherFactory of factoryDetails) {
      const target = otherFactory.input.find(
        (x) => x.product === currentFactory.output.product
      );
      if (target) {
        currentFactory.targetFactories.push({
          timestamp: otherFactory.timestamp,
          rate: target.rate,
          product: otherFactory.output.product,
        });
      }
      const source = currentFactory.input.find(
        (x) => x.product === otherFactory.output.product
      );
      if (source) {
        currentFactory.sourceFactories.push({
          timestamp: otherFactory.timestamp,
          product: otherFactory.output.product,
          rate: otherFactory.output.rate,
        });
      }
    }
  }
};
