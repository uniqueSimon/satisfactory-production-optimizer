import { Table } from "antd";
import { getRecipesFromConfig } from "./getRecipesFromConfig";
import { generateCombinations } from "./generateCombinations";
import { calculateProductionSetup } from "./calculateProductionSetup";
import { findAllRelatedProducts } from "./findAllRelatedProducts";

export interface Recipe {
  className: string;
  productName: string;
  productAmount: number;
  ingredients: { name: string; amount: number }[];
  time: number;
}

const product = "Desc_ModularFrame_C";
const outputRate = 2;

const compoundProducts = [
  "Desc_ModularFrame_C",
  "Desc_IronPlateReinforced_C",
  "Desc_IronPlate_C",
  "Desc_IronIngot_C",
];

export const endProducts = [
  "Desc_OreIron_C",
  "Desc_OreCopper_C",
  "Desc_Stone_C",
  "Desc_Coal_C",
  "Desc_OreGold_C",
  "Desc_Water_C",
  "Desc_Plastic_C",
  "Desc_Rubber_C",
  "Desc_PetroleumCoke_C",
  "Desc_Sulfur_C",
  "Desc_CompactedCoal_C"
];

export const App = () => {
  const recipes = getRecipesFromConfig();

  const allRelatedProducts = findAllRelatedProducts(product, recipes);
  console.log(allRelatedProducts);

  const numberOfAlternateRecipes: number[] = [];
  for (const compountProduct of compoundProducts) {
    const count = recipes.filter(
      (x) => x.productName === compountProduct
    ).length;
    numberOfAlternateRecipes.push(count);
  }
  const combinations = generateCombinations(numberOfAlternateRecipes);

  const dataSource: {
    key: string;
    combination: Map<string, number>;
    productionUnits: {
      product: string;
      rate: number;
      numberOfMachines?: number;
      variant?: number;
    }[];
  }[] = [];
  for (const combination of combinations) {
    const recipeOfEachProd: Map<string, number> = new Map();
    for (let i = 0; i < compoundProducts.length; i++) {
      recipeOfEachProd.set(compoundProducts[i], combination[i]);
    }
    const returnValue = calculateProductionSetup(
      product,
      outputRate,
      recipeOfEachProd,
      recipes
    );
    dataSource.push({
      key: combination.join(),
      combination: recipeOfEachProd,
      productionUnits: returnValue,
    });
  }
  return (
    <>
      <Table
        pagination={false}
        columns={[
          {
            dataIndex: "combination",
            title: "Combination",
            render: (x) => [...x.entries()].join("; "),
          },
          {
            dataIndex: "productionUnits",
            title: "Production Units",
            render: (x) => <pre>{JSON.stringify(x, null, 0)}</pre>,
          },
        ]}
        dataSource={dataSource}
      />
      <pre>{JSON.stringify(recipes, null, 2)}</pre>
    </>
  );
};
