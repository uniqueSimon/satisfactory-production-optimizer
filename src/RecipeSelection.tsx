import { Radio, Table } from "antd";
import { RecipeTooltip } from "./RecipeTooltip";
import { findRecipeByName, Recipe } from "./App";
import { TreeBuilder } from "./TreeBuilder";

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
  productToProduce: string;
  wantedOutputRate: number;
  inputProducts: string[];
}
export const RecipeSelection = (props: Props) => {
  const selectedRecipes: Recipe[] = [];
  props.recipeSelection.forEach((value) => {
    const recipe = findRecipeByName.get(value.selected)!;
    selectedRecipes.push(recipe);
  });
  return (
    <div style={{ margin: 10, border: "solid" }}>
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
                  if (
                    e.target.value.includes("Alternate_") ||
                    e.target.value.includes("Residual")
                  ) {
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
      <TreeBuilder
        currentRecipes={selectedRecipes}
        productToProduce={props.productToProduce}
        wantedOutputRate={props.wantedOutputRate}
        currentProducts={props.inputProducts}
      />
    </div>
  );
};
