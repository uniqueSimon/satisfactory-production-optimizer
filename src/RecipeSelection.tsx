import { Checkbox, Table } from "antd";
import { Recipe } from "./App";

interface Props {
  groupedRecipes: Map<
    string,
    {
      recipe: Recipe;
      selected: boolean;
    }[]
  >;
  setGroupedRecipes: React.Dispatch<
    React.SetStateAction<
      Map<
        string,
        {
          recipe: Recipe;
          selected: boolean;
        }[]
      >
    >
  >;
}
export const RecipeSelection = (props: Props) => (
  <Table
    columns={[
      { dataIndex: "product" },
      {
        dataIndex: "recipes",
        render: (x: { recipe: Recipe; selected: boolean }[], record: any) => (
          <Checkbox.Group
            options={x.map((y) => ({
              label: y.recipe.recipeName,
              value: y.recipe.recipeName,
            }))}
            value={x.filter((y) => y.selected).map((y) => y.recipe.recipeName)}
            onChange={(newSelected) =>
              props.setGroupedRecipes((old) => {
                const newGrouped = new Map(old);
                newGrouped.set(
                  record.product,
                  x.map((y) => ({
                    ...y,
                    selected: newSelected.includes(y.recipe.recipeName),
                  }))
                );
                return newGrouped;
              })
            }
          />
        ),
      },
    ]}
    dataSource={Array.from(props.groupedRecipes).map((x, i) => ({
      key: i,
      product: x[0],
      recipes: x[1],
    }))}
  />
);
