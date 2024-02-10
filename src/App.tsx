import { Col, Divider, Row, Table, Tooltip } from "antd";
import { getRecipesFromConfig } from "./getRecipesFromConfig";
import { generateCombinations } from "./generateCombinations";
import { calculateProductionSetup } from "./calculateProductionSetup";
import { findAllRelatedRecipes } from "./findAllRelatedRecipes";
import { getRemainingRecipes } from "./deleteNotNeededRecipes";

export interface Recipe {
  className: string;
  productName: string;
  productAmount: number;
  ingredients: { name: string; amount: number }[];
  time: number;
}
export interface ProductionUnit {
  product: string;
  rate: number;
  numberOfMachines?: number;
  variant?: number;
  recipeName?: string;
}
const product = "ModularFrameHeavy";
const outputRate = 2.813;

export const endProducts = [
  "OreIron",
  "OreCopper",
  "Stone",
  "Coal",
  "OreGold",
  "Water",
  "Plastic",
  "Rubber",
  "PetroleumCoke",
  "Sulfur",
  "CompactedCoal",
  "RawQuartz",
  "OreBauxite",
];
const notWantedEndProducts = [
  "OreGold",
  "Water",
  "OreGold",
  "Plastic",
  "Rubber",
  "PetroleumCoke",
  "Sulfur",
  "CompactedCoal",
  "RawQuartz",
  "OreBauxite",
];

const sumResourceRates = (inputList: ProductionUnit[]) => {
  const ret: ProductionUnit[] = [];
  for (const item of inputList) {
    const existingItem = ret.find((x) => x.product === item.product);
    if (existingItem) {
      existingItem.rate += item.rate;
    } else {
      ret.push(item);
    }
  }
  return ret;
};

export const App = () => {
  const allRecipes = getRecipesFromConfig();
  const relatedRecipes = findAllRelatedRecipes(product, allRecipes);
  console.log("relatedRecipes.length", relatedRecipes.length);
  const recipes = getRemainingRecipes(relatedRecipes, notWantedEndProducts);
  console.log("recipes.length", recipes.length);
  const productVariations = new Map<string, number>();
  for (const recipe of recipes) {
    const count = productVariations.get(recipe.productName);
    productVariations.set(recipe.productName, count ? count + 1 : 1);
  }
  const allRelatedProducts = Array.from(productVariations.keys());
  console.log("allRelatedProducts", allRelatedProducts);
  const numberOfAlternateRecipes = Array.from(productVariations.values());

  const combinations = generateCombinations(numberOfAlternateRecipes);
  console.log("combinations.length", combinations.length);

  const dataSource: {
    key: string;
    combination: Map<string, number>;
    productionUnits: ProductionUnit[];
    resources: ProductionUnit[];
    identifier: string;
  }[] = [];
  for (const combination of combinations) {
    const recipeOfEachProd: Map<string, number> = new Map();
    for (let i = 0; i < allRelatedProducts.length; i++) {
      recipeOfEachProd.set(allRelatedProducts[i], combination[i]);
    }
    const returnValue = calculateProductionSetup(
      product,
      outputRate,
      recipeOfEachProd,
      recipes
    );
    const identifier = JSON.stringify(returnValue);
    if (!dataSource.some((x) => x.identifier === identifier)) {
      dataSource.push({
        key: combination.join(),
        combination: recipeOfEachProd,
        productionUnits: returnValue,
        resources: sumResourceRates(
          returnValue.filter((x) => x.variant === undefined)
        ),
        identifier,
      });
    }
  }
  console.log("dataSource.length", dataSource.length);

  const renderFunction = (x: ProductionUnit[]) => (
    <Table
      showHeader={false}
      pagination={false}
      columns={[
        { dataIndex: "product" },
        {
          dataIndex: "rate",
          render: (x) => (x ? Math.round(x * 100) / 100 : null),
        },
        {
          dataIndex: "numberOfMachines",
          render: (x) => (x ? Math.round(x * 100) / 100 : null),
        },
        { dataIndex: "recipeName" },
        {
          dataIndex: "ingredients",
          render: (_, x) =>
            recipes
              .find((y) => y.className === x.recipeName)
              ?.ingredients.map((z) => z.name)
              .join(", "),
        },
      ]}
      dataSource={x.map((y, i) => ({
        key: i,
        ...y,
      }))}
    />
  );
  const sortedDataSource = dataSource.sort((a, b) => {
    const numberOfResources = a.resources.length - b.resources.length;
    const rateA = a.resources.reduce((acc, x) => acc + x.rate, 0);
    const rateB = b.resources.reduce((acc, x) => acc + x.rate, 0);
    return numberOfResources === 0 ? rateA - rateB : numberOfResources;
  });

  return (
    <>
      <Table
        columns={[
          {
            dataIndex: "resources",
            title: "Resources",
            render: renderFunction,
          },
          {
            dataIndex: "usedRecipes",
            title: "Used Recipes",
            render: (_, x) => {
              const recipeWithIngredients: {
                recipeName: string;
                ingredients: string;
              }[] = [];
              for (const productionUnit of x.productionUnits) {
                if (
                  productionUnit.recipeName &&
                  !recipeWithIngredients.some(
                    (y) => y.recipeName === productionUnit.recipeName
                  )
                ) {
                  const ingredients = recipes
                    .find((y) => y.className === productionUnit.recipeName)!
                    .ingredients.map((z) => z.name)
                    .join(", ");
                  recipeWithIngredients.push({
                    recipeName: productionUnit.recipeName,
                    ingredients,
                  });
                }
              }
              return (
                <Row gutter={6}>
                  {recipeWithIngredients.map((x) => (
                    <Col key={x.recipeName}>
                      <Tooltip title={x.ingredients}>{x.recipeName}</Tooltip>
                      <Divider type="vertical" />
                    </Col>
                  ))}
                </Row>
              );
            },
          },
          {
            dataIndex: "numberOfMachines",
            title: "Number Of Machines",
            render: (_, x) =>
              Math.round(
                x.productionUnits.reduce(
                  (acc, x) => acc + (x.numberOfMachines ?? 0),
                  0
                ) * 100
              ) / 100,
          },
          /* {
            dataIndex: "productionUnits",
            title: "Production Units",
            render: renderFunction,
          }, */
        ]}
        dataSource={sortedDataSource.slice(0, 100)}
      />
      <pre>{JSON.stringify(recipes, null, 2)}</pre>
    </>
  );
};
