import { Checkbox, Space, Table } from "antd";
import { Recipe } from "./App";
import { DetailedRecipeTooltip } from "./DetailedRecipeTooltip";
import { RecipeTooltip } from "./RecipeTooltip";
import { productDisplayNameMapping } from "./getProductDisplayNames";

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
  findRecipeByName: Map<string, Recipe>;
  inputProducts: string[];
  currentRecipes: Recipe[];
}
export const RecipeSelection = (props: Props) => (
  <Table
    pagination={{ pageSize: 5 }}
    columns={[
      {
        dataIndex: "product",
        title: "Intermediate products",
        width: 250,
        render: (product: string) => productDisplayNameMapping.get(product),
      },
      {
        dataIndex: "recipes",
        title: "Available recipes",
        render: (
          rowRecipes: { recipe: Recipe; selected: boolean }[],
          record
        ) => (
          <Checkbox.Group
            options={rowRecipes.map((rowRecipe) => {
              const recipes = props.currentRecipes.filter(
                (currentRecipe) =>
                  !rowRecipes.some(
                    (x) =>
                      x.recipe.recipeName !== rowRecipe.recipe.recipeName &&
                      x.recipe.recipeName === currentRecipe.recipeName
                  )
              );
              const recipe = props.findRecipeByName.get(
                rowRecipe.recipe.recipeName
              )!;
              return {
                label: (
                  <Space>
                    <RecipeTooltip recipe={recipe} />
                    <DetailedRecipeTooltip
                      recipe={recipe}
                      inputProducts={props.inputProducts}
                      currentRecipes={recipes}
                    />
                  </Space>
                ),
                value: rowRecipe.recipe.recipeName,
              };
            })}
            value={rowRecipes
              .filter((y) => y.selected)
              .map((y) => y.recipe.recipeName)}
            onChange={(newSelected) =>
              props.setGroupedRecipes((old) => {
                const newGrouped = new Map(old);
                newGrouped.set(
                  record.product,
                  rowRecipes.map((y) => ({
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
    dataSource={Array.from(props.groupedRecipes)
      .map((x) => ({
        key: x[0],
        product: x[0],
        recipes: x[1],
      }))
      .sort((a, b) => a.product?.localeCompare(b.product) ?? 0)}
  />
);
