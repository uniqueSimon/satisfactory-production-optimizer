import { Select } from "antd";
import { Recipe } from "../../App";
import { RecipeTooltip } from "../../reusableComp/RecipeTooltip";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { DownCircleOutlined } from "@ant-design/icons";

export const EfficientTreeSelection = (props: {
  productToProduce: string;
  wantedOutputRate: number;
  dedicatedProducts: string[];
  selectedRecipes: string[];
  availableRecipes: Recipe[];
  setSelectedRecipes: (selectedRecipes: string[]) => void;
  weights: Map<
    string,
    {
      recipeName: string;
      weight: number;
    }[]
  >;
}) => {
  const Recursion = (propsRec: { product: string; rate: number }) => {
    const recipes = props.availableRecipes.filter(
      (x) => x.product.name === propsRec.product
    );
    const index = props.dedicatedProducts.indexOf(propsRec.product);
    const isRoot = propsRec.product === props.productToProduce;
    const productWeights = props.weights.get(propsRec.product);
    const minWeight = productWeights
      ? Math.min(...props.weights.get(propsRec.product)!.map((x) => x.weight))
      : Infinity;
    if ((!isRoot && index > -1) || recipes.length === 0 || propsRec.rate < 0) {
      return (
        <div style={{ width: "100%" }}>
          <ProductBox
            isRoot={false}
            product={propsRec.product}
            rate={propsRec.rate}
            color={
              !isRoot && index > -1
                ? `hsl(${(index * 200) % 360},20%,60%)`
                : "hsl(0,0%,60%)"
            }
            weight={minWeight}
          />
        </div>
      );
    }
    const currentRecipe = recipes.find((x) =>
      props.selectedRecipes.includes(x.recipeName)
    );
    return (
      <div style={{ width: "100%" }}>
        <ProductBox
          isRoot={isRoot}
          product={propsRec.product}
          rate={propsRec.rate}
          color={
            index > -1 ? `hsl(${(index * 200) % 360},20%,60%)` : "lightgray"
          }
          weight={minWeight}
        />
        <RecipeSelection
          currentRecipe={currentRecipe}
          rate={propsRec.rate}
          recipes={recipes}
          selectedRecipes={props.selectedRecipes}
          setSelectedRecipes={props.setSelectedRecipes}
          weights={props.weights.get(propsRec.product)!}
        />
        {currentRecipe && (
          <div style={{ display: "flex" }}>
            {currentRecipe.ingredients.map((ingredient) => {
              const ingredientRate =
                (ingredient.amount / currentRecipe.product.amount) *
                propsRec.rate;
              return (
                <Recursion
                  key={`${ingredient.name}${ingredientRate > 0}`}
                  product={ingredient.name}
                  rate={ingredientRate}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };
  return (
    <div style={{ marginTop: 10 }}>
      <Recursion
        product={props.productToProduce}
        rate={props.wantedOutputRate}
      />
    </div>
  );
};

const ProductBox = (props: {
  product: string;
  rate: number;
  color: string;
  isRoot: boolean;
  weight: number;
}) => (
  <div
    style={{
      display: "flex",
      border: props.rate < 0 ? "solid red" : "solid",
      borderRadius: 8,
      borderWidth: props.isRoot ? "thick" : "medium",
      margin: -1,
      padding: 5,
      whiteSpace: "nowrap",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: props.color,
    }}
  >
    {Math.round(props.rate * 10000) / 10000}
    {"/min"}
    <IconWithTooltip item={props.product} />
    {`(${Math.round(props.weight * props.rate * 100) / 100} WP)`}
  </div>
);

const RecipeSelection = (props: {
  recipes: Recipe[];
  rate: number;
  currentRecipe?: Recipe;
  selectedRecipes: string[];
  setSelectedRecipes: (recipes: string[]) => void;
  weights: { recipeName: string; weight: number }[];
}) => {
  if (props.recipes.length === 1) {
    const recipe = props.recipes[0];
    const numberOfMachines =
      props.rate / ((recipe.product.amount / recipe.time) * 60);
    return (
      <div
        style={{
          height: 30,
          border: "solid",
          borderRadius: 8,
          textAlign: "center",
          margin: -1,
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.currentRecipe ? (
          <>
            {Math.round(numberOfMachines * 1000000) / 1000000}
            <span style={{ margin: "0 5px" }}>x</span>
            <RecipeTooltip recipe={recipe} rate={props.rate} />
            <IconWithTooltip item={recipe.producedIn} />
          </>
        ) : (
          <DownCircleOutlined
            onClick={() => {
              if (!props.currentRecipe) {
                props.setSelectedRecipes([
                  ...props.selectedRecipes,
                  recipe.recipeName,
                ]);
              }
            }}
          />
        )}
      </div>
    );
  } else {
    return (
      <Select
        size="large"
        popupMatchSelectWidth={false}
        options={props.recipes.map((x) => {
          const numberOfMachines =
            props.rate / ((x.product.amount / x.time) * 60);
          return {
            key: x.recipeName,
            value: x.recipeName,
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {Math.round(numberOfMachines * 1000000) / 1000000}
                <span style={{ margin: "0 5px" }}>x</span>
                <RecipeTooltip recipe={x} rate={props.rate} />
                <IconWithTooltip item={x.producedIn} />
                {`(${
                  Math.round(
                    props.weights.find(
                      (recipe) => recipe.recipeName === x.recipeName
                    )!.weight *
                      props.rate *
                      100
                  ) / 100
                } WP)`}
              </div>
            ),
          };
        })}
        value={props.currentRecipe?.recipeName}
        onChange={(selected) => {
          const removedOld = props.selectedRecipes.filter(
            (x) => x !== props.currentRecipe?.recipeName
          );
          props.setSelectedRecipes(
            selected ? [...removedOld, selected] : removedOld
          );
        }}
        style={{
          height: 43,
          width: "100%",
          border: "solid",
          borderRadius: 8,
          textAlign: "center",
          margin: -1,
          padding: 3,
        }}
        allowClear={true}
      />
    );
  }
};
