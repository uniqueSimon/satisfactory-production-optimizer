import { Collapse, Select } from "antd";
import { allRecipes } from "../parseGameData/allRecipesFromConfig";

export const AlternateRecipes = (props: {
  foundAltRecipes: string[];
  setFoundAltRecipes: (foundAltRecipes: string[]) => void;
}) => (
  <div style={{ border: "solid grey", borderRadius: 8 }}>
    <Collapse>
      <Collapse.Panel key={1} header="Found alternate recipes">
        <Select
          mode="multiple"
          allowClear={true}
          options={allRecipes
            .filter((x) => x.isAlternate)
            .map((x) => ({
              key: x.recipeName,
              value: x.recipeName,
              label: x.displayName,
            }))}
          value={props.foundAltRecipes}
          onChange={props.setFoundAltRecipes}
          filterOption={(input, option) =>
            option!.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Collapse.Panel>
    </Collapse>
  </div>
);
