import { Table } from "antd";
import { RecipeLookup } from "./App";

export const RecipeOverview = (props: { recipeLookup: RecipeLookup }) => {
  const dataSource: {
    key: string;
    product: string;
    recipeName: string;
    productAmount: number;
    time: number;
    ingredients: { name: string; amount: number }[];
  }[] = [];
  props.recipeLookup.forEach((value, key) => {
    for (const recipe of value) {
      dataSource.push({
        key: recipe.recipeName,
        product: key,
        recipeName: recipe.recipeName,
        productAmount: recipe.productAmount,
        time: recipe.time,
        ingredients: recipe.ingredients,
      });
    }
  });
  return (
    <Table
      columns={[
        { dataIndex: "product" },
        { dataIndex: "recipeName" },
        { dataIndex: "productAmount" },
        { dataIndex: "time" },
        {
          dataIndex: "ingredients",
          children: [{ dataIndex: "name" }, { dataIndex: "amount" }],
        },
      ]}
      dataSource={dataSource}
    />
  );
};
