import { Radio, Table } from "antd";
import { RecipeTooltip } from "./RecipeTooltip";
import { findRecipeByName } from "./App";

interface Props {
  recipeSelection: Map<
    string,
    {
      recipes: string[];
      selected: string;
    }
  >;
  setRecipeSelection: (
    value: React.SetStateAction<
      Map<
        string,
        {
          recipes: string[];
          selected: string;
        }
      >
    >
  ) => void;
  selectedAltRecipes: string[];
  setSelectedAltRecipes: (selectedAltRecipes: string[]) => void;
}
export const RecipeSelection = (props: Props) => {
  return (
    <Table
      columns={[
        { dataIndex: "product", title: "Product" },
        { dataIndex: "selection", title: "Selection" },
      ]}
      dataSource={Array.from(props.recipeSelection).map((x, i) => ({
        key: i,
        product: x[0],
        selection: (
          <Radio.Group
            options={x[1].recipes.map((y) => ({
              label: <RecipeTooltip recipe={findRecipeByName.get(y)!} />,
              value: y,
            }))}
            value={x[1].selected}
            onChange={(e) => {
              props.setRecipeSelection((prev) => {
                const prevEntry = prev.get(x[0])!;
                const newAltSelection = props.selectedAltRecipes.filter(
                  (x) => x !== prevEntry.selected
                );
                if (e.target.value.includes("Alternate_")) {
                  newAltSelection.push(e.target.value);
                }
                props.setSelectedAltRecipes(newAltSelection);
                prev.set(x[0], { ...prevEntry, selected: e.target.value });
                return new Map(prev);
              });
            }}
          />
        ),
      }))}
    />
  );
};
