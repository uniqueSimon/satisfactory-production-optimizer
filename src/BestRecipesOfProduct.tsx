import { Button, Col, Divider, Row, Table, Tooltip } from "antd";
import { RecipeVariant } from "./calculationBottomUp";

export const BestRecipesOfProducts = (props: {
  productToProduce: string;
  recipeVariants: RecipeVariant[];
  ingredientFinder: Map<string, string[]>;
  chooseResourceTypes: (resourceTypes: Set<string>) => void;
}) => {
  const dataSource = props.recipeVariants
    .sort((a, b) => [...a.resourceTypes].length - [...b.resourceTypes].length)
    .map((x, i) => {
      const usedRecipes = new Set<string>();
      for (const detail of x.details) {
        detail.recipeNames.forEach((x) => usedRecipes.add(x));
      }
      return {
        key: i,
        resourceTypes: x.resourceTypes,
        resources: x.resources,
        details: x.details,
        usedRecipes: [...usedRecipes],
      };
    });
  return (
    <Table
      columns={[
        {
          dataIndex: "resourceTypes",
          title: "Choose Resource Types",
          render: (x: Set<string>) => (
            <Button onClick={() => props.chooseResourceTypes(x)}>Choose</Button>
          ),
        },
        {
          dataIndex: "resources",
          title: "Resources",
          width: 200,
          render: (x: Map<string, number>) => {
            return [...x.entries()].map(([name, rate]) => (
              <Row key={name} justify={"space-between"}>
                <Col>{name}</Col>
                <Col>{Math.round(rate * 100) / 100}</Col>
              </Row>
            ));
          },
        },
        {
          dataIndex: "usedRecipes",
          title: "Used Recipes",
          width: 500,
          render: (x: string[]) => {
            return (
              <Row gutter={6}>
                {x.map((x) => (
                  <Col key={x}>
                    <Tooltip title={props.ingredientFinder.get(x)!.join(", ")}>
                      {x}
                    </Tooltip>
                    <Divider type="vertical" />
                  </Col>
                ))}
              </Row>
            );
          },
        },
        {
          dataIndex: "linkToCalculator",
          title: "Link to satisfactory-calculator.com",
          render: (_, record) => {
            const baseLink =
              "https://satisfactory-calculator.com/en/planners/production/index/json/";
            const altRecipes = record.usedRecipes.map((x) => `Recipe_${x}_C`);
            const obj = {
              [`Desc_${props.productToProduce}_C`]: "1",
              altRecipes,
            };
            return (
              <Button
                onClick={() =>
                  window.open(
                    `${baseLink}${encodeURIComponent(JSON.stringify(obj))}`,
                    "_blank"
                  )
                }
              >
                Open
              </Button>
            );
          },
        },
        {
          title: "Details",
          dataIndex: "details",
          render: (x) => JSON.stringify(x),
        },
      ]}
      dataSource={dataSource}
    />
  );
};
