import { useState } from "react";
import { Form, Select, Typography } from "antd";
import { allRecipes } from "./parseGameData/allRecipesFromConfig";
import { useLocalStorage } from "./reusableComp/useLocalStorage";
import { SavedSettings } from "./components/SavedSettings";
import { ProductToProduce } from "./components/ProductToProduce";
import { EfficientTreeSelection } from "./components/EfficientTreeSelection";
import { NeededResources } from "./components/NeededRessources";
import { DedicatedProducts } from "./components/DedicatedProducts";
import { calculateTreeResults } from "./calculateTreeResults";
import { AlternateRecipes } from "./components/AlternateRecipes";
import { CustomCard } from "./reusableComp/CustomCard";
import { OutputRate } from "./components/OutputRate";

export interface Recipe {
  recipeName: string;
  displayName: string;
  product: { name: string; amount: number };
  ingredients: { name: string; amount: number }[];
  time: number;
  isAlternate: boolean;
  producedIn: string;
}

export const App = () => {
  const [foundAltRecipes, setFoundAltRecipes] = useLocalStorage<string[]>(
    "found-alt-recipes",
    []
  );
  const [productToProduce, setProductToProduce] = useState("");
  const [wantedOutputRate, setWantedOutputRate] = useState(60);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [dedicatedProducts, setDedicatedProducts] = useState<string[]>([]);
  const availableRecipes = allRecipes.filter(
    (x) => !x.isAlternate || foundAltRecipes.includes(x.recipeName)
  );
  const { machines, productRates } = calculateTreeResults(
    productToProduce,
    wantedOutputRate,
    selectedRecipes,
    availableRecipes
  );
  const rootRecipe = availableRecipes.find(
    (x) =>
      x.product.name === productToProduce &&
      selectedRecipes.includes(x.recipeName)
  );
  return (
    <div
      style={{
        border: "solid",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "white",
      }}
    >
      <Typography.Title>Satisfactory Production Optimizer</Typography.Title>
      <Form>
        <SavedSettings
          dedicatedProducts={dedicatedProducts}
          productToProduce={productToProduce}
          selectedRecipes={selectedRecipes}
          wantedOutputRate={wantedOutputRate}
          setProductToProduce={setProductToProduce}
          setSelectedRecipes={setSelectedRecipes}
          setWantedOutputRate={setWantedOutputRate}
          setDedicatedProducts={setDedicatedProducts}
        />
        <AlternateRecipes
          foundAltRecipes={foundAltRecipes}
          setFoundAltRecipes={setFoundAltRecipes}
        />
        <CustomCard>
          <div style={{ display: "flex" }}>
            <ProductToProduce
              productToProduce={productToProduce}
              setProductToProduce={(product) => {
                setSelectedRecipes([]);
                setDedicatedProducts([]);
                setProductToProduce(product);
              }}
            />
            <OutputRate
              rootRecipe={rootRecipe}
              setWantedOutputRate={setWantedOutputRate}
              wantedOutputRate={wantedOutputRate}
            />
          </div>
          <Form.Item label="Selected recipes">
            <Select
              mode="multiple"
              allowClear={true}
              options={allRecipes.map((x) => ({
                key: x.recipeName,
                value: x.recipeName,
                label: x.displayName,
              }))}
              value={selectedRecipes}
              onChange={setSelectedRecipes}
            />
          </Form.Item>
          {productToProduce && (
            <DedicatedProducts
              currentProducts={[...productRates.entries()]
                .filter((x) => x[1].type === "MULTIPLE")
                .map((x) => x[0])}
              dedicatedProducts={dedicatedProducts}
              setDedicatedProducts={setDedicatedProducts}
            />
          )}
        </CustomCard>
      </Form>
      {productToProduce && (
        <>
          <NeededResources machines={machines} productRates={productRates} />
          <EfficientTreeSelection
            dedicatedProducts={dedicatedProducts}
            productToProduce={productToProduce}
            selectedRecipes={selectedRecipes}
            availableRecipes={availableRecipes}
            wantedOutputRate={wantedOutputRate}
            setSelectedRecipes={setSelectedRecipes}
          />
          <div style={{ display: "flex" }}>
            {dedicatedProducts.map((product) => (
              <EfficientTreeSelection
                key={product}
                dedicatedProducts={dedicatedProducts}
                productToProduce={product}
                selectedRecipes={selectedRecipes}
                availableRecipes={availableRecipes}
                wantedOutputRate={productRates.get(product)!.rate}
                setSelectedRecipes={setSelectedRecipes}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
