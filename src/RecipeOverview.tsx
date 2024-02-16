import { Table } from "antd";
import { LookedUpRecipe } from "./App";

export const RecipeOverview = (props: {
  recipeLookup: Map<string, LookedUpRecipe[]>;
}) => {
  const dataSource: {
    key: string;
    product: string;
    children: {
      key: string;
      recipeName: string;
      productAmount: number;
      time: number;
      children: { key: string; name: string; amount: number }[];
    }[];
  }[] = [];
  props.recipeLookup.forEach((value, key) => {
    dataSource.push({
      key: key,
      product: key,
      children: value.map((recipe) => ({
        key: `${key}${recipe.recipeName}`,
        recipeName: recipe.recipeName,
        productAmount: recipe.productAmount,
        time: recipe.time,
        children: recipe.ingredients.map((x) => ({
          key: `${recipe.recipeName}${x.name}`,
          ...x,
        })),
      })),
    });
  });
  return (
    <Table
      size="small"
      expandable={{ defaultExpandAllRows: true }}
      columns={[
        { dataIndex: "product", title: "Product" },
        { dataIndex: "recipeName", title: "Recipe Name" },
        { dataIndex: "productAmount", title: "Product Amount" },
        { dataIndex: "time", title: "Time" },
        {
          dataIndex: "ingredients",
          title: "Ingredients",
          children: [{ dataIndex: "name" }, { dataIndex: "amount" }],
        },
      ]}
      dataSource={dataSource}
    />
  );
};
