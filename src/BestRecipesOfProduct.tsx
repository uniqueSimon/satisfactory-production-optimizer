import { Button, Col, Row, Table } from "antd";
import { RecipeVariant } from "./recipeTreeSearch";
import { SelectOutlined } from "@ant-design/icons";
import { Recipe } from "./App";
import { RecipeTooltip } from "./RecipeTooltip";
import { productDisplayNameMapping } from "./getProductDisplayNames";

export const BestRecipesOfProducts = (props: {
  productToProduce: string;
  wantedOutputRate: number;
  recipeVariants: RecipeVariant[];
  currentResourceTypes: string[];
  findRecipeByName: Map<string, Recipe>;
  chooseResourceTypes: (resourceTypes: Set<string>) => void;
}) => {
  const dataSource = props.recipeVariants
    .sort((a, b) => {
      const numberDifference =
        [...a.resourceTypes].length - [...b.resourceTypes].length;
      if (numberDifference) {
        return numberDifference;
      }
      const totalRateA = [...a.resources.values()].reduce((a, b) => a + b, 0);
      const totalRateB = [...b.resources.values()].reduce((a, b) => a + b, 0);
      return totalRateA - totalRateB;
    })
    .map((x, i) => ({
      key: i,
      ...x,
    }));
  return (
    <Table
      columns={[
        {
          dataIndex: "resourceTypes",
          title: "Choose Resource Types",
          render: (x: Set<string>) => (
            <Button
              disabled={
                [...x].length === props.currentResourceTypes.length &&
                [...x].every((x) => props.currentResourceTypes.includes(x))
              }
              onClick={() => props.chooseResourceTypes(x)}
            >
              Choose
            </Button>
          ),
        },
        {
          dataIndex: "resources",
          title: "Resources",
          width: 200,
          render: (x: Map<string, number>) => {
            return [...x.entries()].map(([name, rate]) => (
              <Row key={name} justify={"space-between"}>
                <Col>{productDisplayNameMapping.get(name)}</Col>
                <Col>{Math.round(rate * 100) / 100}</Col>
              </Row>
            ));
          },
        },
        {
          dataIndex: "usedRecipes",
          title: "Used Recipes",
          width: 500,
          render: (x: Map<string, number>) =>
            Array.from(x).map(([name, number]) => {
              const recipe = props.findRecipeByName.get(name)!;
              return (
                <Row key={name} justify={"space-between"}>
                  <Col>
                    <RecipeTooltip recipe={recipe} />
                  </Col>
                  <Col>{Math.floor(number * 100) / 100}</Col>
                </Row>
              );
            }),
        },
        {
          dataIndex: "totalProductionUnits",
          title: "Total Production Units",
          render: (_, record) =>
            Math.floor(
              [...record.usedRecipes.values()].reduce((a, b) => a + b, 0) * 100
            ) / 100,
        },
        {
          dataIndex: "linkToCalculator",
          title: "Link to satisfactory-calculator.com",
          render: (_, record) => {
            const baseLink =
              "https://satisfactory-calculator.com/en/planners/production/index/json/";
            const altRecipes = [...record.usedRecipes.keys()].map(
              (x) => `Recipe_${x}_C`
            );
            const obj = {
              [`Desc_${props.productToProduce}_C`]:
                props.wantedOutputRate.toString(),
              altRecipes,
            };
            const url = `${baseLink}${encodeURIComponent(JSON.stringify(obj))}`;
            return (
              <Button onClick={() => window.open(url, "_blank")}>
                <SelectOutlined rotate={90} />
              </Button>
            );
          },
        },
      ]}
      dataSource={dataSource}
    />
  );
};
