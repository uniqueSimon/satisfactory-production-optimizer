import { Button, Collapse, Form, Select, Switch, Table } from "antd";
import { allProducts, allRecipes, Recipe } from "@/App";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { useState } from "react";

export const AlternateRecipes = (props: {
  foundAltRecipes: string[];
  weights: Map<
    string,
    {
      recipeName: string;
      weight: number;
    }[]
  >;
  setFoundAltRecipes: (foundAltRecipes: string[]) => void;
}) => {
  const [hideBestFoundRecipes, setHideBestFoundRecipes] = useState(true);
  const recipePerProduct = allProducts.map((product) => {
    const recipes = allRecipes.filter((x) => x.product.name === product);
    const weights = props.weights.get(product);
    const baseRecipe = recipes.find((x) => !x.isAlternate);
    const baseWeight =
      weights?.find((x) => x.recipeName === baseRecipe?.recipeName)?.weight ??
      Infinity;
    const alternateRecipes = recipes
      .filter((x) => x.isAlternate)
      .map((x) => ({
        weight:
          weights?.find((y) => y.recipeName === x.recipeName)?.weight ??
          Infinity,
        recipe: x,
      }));
    const bestRecipe = alternateRecipes.reduce(
      (prev, cur) => {
        if (cur.weight < prev.weight) {
          return { recipeName: cur.recipe.recipeName, weight: cur.weight };
        }
        return prev;
      },
      { recipeName: "base", weight: baseWeight }
    );
    return {
      product,
      bestRecipe,
      baseRecipe: {
        weight: baseWeight,
        recipe: baseRecipe,
      },
      alternateRecipes,
    };
  });
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
              <div>
                <Form.Item label="Hide already found best Recipes">
                  <Switch
                    checked={hideBestFoundRecipes}
                    onChange={setHideBestFoundRecipes}
                  />
                </Form.Item>
                <Table
                  pagination={false}
                  size="small"
                  columns={[
                    { dataIndex: "tier" },
                    {
                      dataIndex: "product",
                      render: (product: string) => (
                        <IconWithTooltip item={product} />
                      ),
                    },
                    {
                      dataIndex: "baseRecipe",
                      render: (
                        recipe: { weight: number; recipe?: Recipe },
                        record
                      ) => (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            border: "solid grey",
                            borderRadius: 8,
                            background:
                              record.bestRecipe.recipeName === "base"
                                ? "lightGreen"
                                : undefined,
                          }}
                        >
                          {Math.round(recipe.weight * 100) / 100}
                          {recipe.recipe?.ingredients.map((ingredient) => (
                            <IconWithTooltip
                              key={`${ingredient.name}${ingredient.amount > 0}`}
                              item={ingredient.name}
                            />
                          )) ?? null}
                        </div>
                      ),
                    },
                    {
                      dataIndex: "altRecipes",
                      render: (
                        recipes: { weight: number; recipe: Recipe }[],
                        record
                      ) => {
                        return (
                          <div style={{ display: "flex" }}>
                            {recipes
                              .sort((a, b) => a.weight - b.weight)
                              .map((recipe) => {
                                const selected = props.foundAltRecipes.includes(
                                  recipe.recipe.recipeName
                                );
                                return (
                                  <Button
                                    key={recipe.recipe.recipeName}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      borderStyle: "solid",
                                      borderColor: selected
                                        ? "blue"
                                        : undefined,
                                      borderWidth: 2,
                                      background:
                                        record.bestRecipe.recipeName ===
                                        recipe.recipe.recipeName
                                          ? "lightGreen"
                                          : undefined,
                                    }}
                                    onClick={() =>
                                      props.setFoundAltRecipes(
                                        !selected
                                          ? [
                                              ...props.foundAltRecipes,
                                              recipe.recipe.recipeName,
                                            ]
                                          : [
                                              ...props.foundAltRecipes.filter(
                                                (x) =>
                                                  x !== recipe.recipe.recipeName
                                              ),
                                            ]
                                      )
                                    }
                                  >
                                    {Math.round(recipe.weight * 100) / 100}
                                    {recipe.recipe.ingredients.map(
                                      (ingredient) => (
                                        <IconWithTooltip
                                          key={`${ingredient.name}${
                                            ingredient.amount > 0
                                          }`}
                                          item={ingredient.name}
                                        />
                                      )
                                    )}
                                    {recipe.recipe.displayName.replace(
                                      "Alternate:",
                                      ""
                                    )}
                                  </Button>
                                );
                              })}
                          </div>
                        );
                      },
                    },
                  ]}
                  dataSource={recipePerProduct
                    .filter(
                      (x) =>
                        x.alternateRecipes.length > 0 &&
                        (!hideBestFoundRecipes ||
                          (x.bestRecipe.recipeName !== "base" &&
                            !props.foundAltRecipes.includes(
                              x.bestRecipe.recipeName
                            )))
                    )
                    .sort(
                      (a, b) =>
                        (a.baseRecipe.recipe?.tier ?? 0) -
                        (b.baseRecipe.recipe?.tier ?? 0)
                    )
                    .map((group) => ({
                      key: group.product,
                      tier: group.baseRecipe.recipe?.tier,
                      product: group.product,
                      baseRecipe: group.baseRecipe,
                      altRecipes: group.alternateRecipes,
                      bestRecipe: group.bestRecipe,
                    }))}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
