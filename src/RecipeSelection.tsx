import { Checkbox, Space, Table } from "antd";
import { Recipe } from "./App";
import { DetailedRecipeTooltip } from "./DetailedRecipeTooltip";
import { RecipeTooltip } from "./RecipeTooltip";

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
      { dataIndex: "product", title: "Intermediate products", width: 250 },
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
              rowRecipes.map((x) => x.recipe);
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
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((x, i) => ({
        key: i,
        product: x[0],
        recipes: x[1],
      }))}
  />
);
