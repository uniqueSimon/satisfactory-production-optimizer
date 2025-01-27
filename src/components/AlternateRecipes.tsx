import { Collapse, Form, Select, Switch } from "antd";
import { allRecipes } from "../parseGameData/allRecipesFromConfig";
import { Recipe } from "@/App";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";

export const AlternateRecipes = (props: {
  foundAltRecipes: string[];
  setFoundAltRecipes: (foundAltRecipes: string[]) => void;
}) => {
  const alternateRecipes = allRecipes.filter((x) => x.isAlternate);
  const tierSorted = alternateRecipes.sort((a, b) => a.tier - b.tier);
  const grouped = tierSorted.reduce((acc, recipe) => {
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup[0].tier === recipe.tier) {
      lastGroup.push(recipe);
    } else {
      acc.push([recipe]);
    }
    return acc;
  }, [] as Recipe[][]);
  return (
    <div style={{ border: "solid grey", borderRadius: 8 }}>
      <Collapse
        items={[
          {
            label: "Found alternate recipes",
            children: (
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
            ),
          },
          {
            children: (
              <Collapse
                items={grouped.map((group, i) => ({
                  label: i,
                  children: group.map((recipe) => (
                    <Form.Item
                      key={recipe.recipeName}
                      label={
                        <div>
                          <IconWithTooltip item={recipe.product.name} />
                          {recipe.displayName}
                        </div>
                      }
                    >
                      <Switch
                        checked={props.foundAltRecipes.includes(
                          recipe.recipeName
                        )}
                        onChange={(checked) => {
                          props.setFoundAltRecipes(
                            checked
                              ? [...props.foundAltRecipes, recipe.recipeName]
                              : [
                                  ...props.foundAltRecipes.filter(
                                    (x) => x !== recipe.recipeName
                                  ),
                                ]
                          );
                        }}
                      />
                    </Form.Item>
                  )),
                }))}
              />
            ),
          },
        ]}
      />
    </div>
  );
};
