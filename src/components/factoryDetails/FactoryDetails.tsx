import { CustomCard } from "@/reusableComp/CustomCard";
import { ProductToProduce } from "./ProductToProduce";
import { OutputRate } from "./OutputRate";
import { Form, Select } from "antd";
import { DedicatedProducts } from "./DedicatedProducts";
import { EfficientTreeSelection } from "./EfficientTreeSelection";
import { SavedFactory } from "../factoryPlanner/FactoryPlanner";
import { calculateTreeResults } from "@/calculateTreeResults";
import { useState } from "react";
import { calculateProductWeights, maxRates } from "@/calculateProductWeights";
import { AlternateRecipes } from "../AlternateRecipes";
import { useLocalStorage } from "@/reusableComp/useLocalStorage";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";

export const FactoryDetails = (props: {
  savedFactory: SavedFactory;
  setSavedFactory: (savedFactory: SavedFactory) => void;
}) => {
  const [foundAltRecipes, setFoundAltRecipes] = useLocalStorage<string[]>(
    "found-alt-recipes",
    []
  );
  const availableRecipes = allRecipes; /* .filter(
        (x) => !x.isAlternate || foundAltRecipes.includes(x.recipeName)
      ); */
  const { productRates, machines } = calculateTreeResults(
    props.savedFactory.productToProduce,
    props.savedFactory.wantedOutputRate,
    props.savedFactory.selectedRecipes,
    availableRecipes
  );
  const rootRecipe = availableRecipes.find(
    (x) =>
      x.product.name === props.savedFactory.productToProduce &&
      props.savedFactory.selectedRecipes.includes(x.recipeName)
  );
  const [excludedResources, setExcludedResources] = useState([]);

  const weights = calculateProductWeights(excludedResources);
  const allResources = [...maxRates.keys()];

  const changeFactory = (property: string, value: any) => {
    const updated = { ...props.savedFactory, [property]: value };
    const { productRates } = calculateTreeResults(
      updated.productToProduce,
      updated.wantedOutputRate,
      updated.selectedRecipes,
      availableRecipes
    );
    const input = Array.from(productRates)
      .filter(([_, value]) => value.type === "RESOURCE")
      .map(([product, value]) => ({ product, rate: value.rate }));
    props.setSavedFactory({ ...updated, input });
  };
  return (
    <>
      <Form.Item label="Resources to exclude from weighting points">
        <Select
          style={{ display: "block" }}
          mode="multiple"
          allowClear={true}
          options={allResources.map((x) => ({
            key: x,
            value: x,
            label: x,
          }))}
          value={excludedResources}
          onChange={setExcludedResources}
        />
      </Form.Item>
      <CustomCard>
        <div style={{ display: "flex" }}>
          <ProductToProduce
            productToProduce={props.savedFactory.productToProduce}
            setProductToProduce={(product) =>
              props.setSavedFactory({
                ...props.savedFactory,
                productToProduce: product,
                dedicatedProducts: [],
                selectedRecipes: [],
                input: [],
              })
            }
          />
          <OutputRate
            rootRecipe={rootRecipe}
            setWantedOutputRate={(wantedOutputRate) =>
              changeFactory("wantedOutputRate", wantedOutputRate)
            }
            wantedOutputRate={props.savedFactory.wantedOutputRate}
          />
        </div>
        <Form.Item label="Selected recipes">
          <Select
            mode="multiple"
            allowClear={true}
            options={availableRecipes.map((x) => ({
              key: x.recipeName,
              value: x.recipeName,
              label: x.displayName,
            }))}
            value={props.savedFactory.selectedRecipes}
            onChange={(selectedRecipes) =>
              changeFactory("selectedRecipes", selectedRecipes)
            }
          />
        </Form.Item>
        {props.savedFactory.productToProduce && (
          <DedicatedProducts
            currentProducts={props.savedFactory.selectedRecipes
              .map((x) => allRecipes.find((y) => y.recipeName === x)!)
              .map((x) => x.product.name)
              .filter((x) => x !== props.savedFactory.productToProduce)}
            dedicatedProducts={props.savedFactory.dedicatedProducts}
            setDedicatedProducts={(dedicatedProducts) =>
              changeFactory("dedicatedProducts", dedicatedProducts)
            }
          />
        )}
      </CustomCard>
      <EfficientTreeSelection
        dedicatedProducts={props.savedFactory.dedicatedProducts ?? []}
        productToProduce={props.savedFactory.productToProduce}
        selectedRecipes={props.savedFactory.selectedRecipes}
        availableRecipes={availableRecipes}
        wantedOutputRate={props.savedFactory.wantedOutputRate}
        setSelectedRecipes={(selectedRecipes) =>
          changeFactory("selectedRecipes", selectedRecipes)
        }
        weights={weights}
      />
      <div style={{ display: "flex" }}>
        {(props.savedFactory.dedicatedProducts ?? []).map((product) => (
          <EfficientTreeSelection
            key={product}
            dedicatedProducts={props.savedFactory.dedicatedProducts}
            productToProduce={product}
            selectedRecipes={props.savedFactory.selectedRecipes}
            availableRecipes={availableRecipes}
            wantedOutputRate={productRates.get(product)!.rate}
            setSelectedRecipes={(selectedRecipes) =>
              changeFactory("selectedRecipes", selectedRecipes)
            }
            weights={weights}
          />
        ))}
      </div>
      <AlternateRecipes
        foundAltRecipes={foundAltRecipes}
        setFoundAltRecipes={setFoundAltRecipes}
      />
    </>
  );
};
