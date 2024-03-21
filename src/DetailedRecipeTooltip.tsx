import { Button, Col, Row, Table, Tooltip } from "antd";
import { Recipe } from "./App";
import { RecipeVariant, recipeTreeSearch } from "./recipeTreeSearch";
import { useState } from "react";
import { UnorderedListOutlined } from "@ant-design/icons";

const overlayStyle = {
  whiteSpace: "nowrap",
  maxWidth: "none",
};

export const DetailedRecipeTooltip = (props: {
  recipe: Recipe;
  inputProducts: string[];
  currentRecipes: Recipe[];
}) => {
  const [cachedVariants, setCachedVariants] = useState<RecipeVariant[]>([]);
  const triggerCalculation = () => {
    const recipeVariants = recipeTreeSearch(
      props.recipe.products[0].name,
      props.inputProducts,
      props.currentRecipes,
      false,
      1
    );
    setCachedVariants(recipeVariants);
  };
  return (
    <Tooltip
      mouseEnterDelay={cachedVariants.length ? 0 : 1}
      overlayStyle={overlayStyle}
      title={
        cachedVariants.length ? (
          <Table
            scroll={{ x: 100, y: 400 }}
            showHeader={false}
            pagination={false}
            columns={[
              {
                dataIndex: "resources",
                width: 200,
                render: (x: Map<string, number>) =>
                  [...x.entries()].map(([name, rate]) => (
                    <Row key={name} justify={"space-between"}>
                      <Col>{name}</Col>
                      <Col>{Math.round(rate * 100) / 100}</Col>
                    </Row>
                  )),
              },
            ]}
            dataSource={cachedVariants.map((x, i) => ({
              key: i,
              resources: x.resources,
            }))}
          />
        ) : (
          "calculate variants"
        )
      }
    >
      <Button onClick={() => triggerCalculation()}>
        <UnorderedListOutlined />
      </Button>
    </Tooltip>
  );
};
