import { Button, Form } from "antd";
import { useLocalStorage } from "../../reusableComp/useLocalStorage";
import { CustomCard } from "@/reusableComp/CustomCard";
import { useState } from "react";
import { SavedFactories } from "./SavedFactories";
import { DetailedView } from "./DetailedView";
import {
  calculateFactoryDetails,
  FactoryDetails,
} from "./calculateFactoryDetails";
import { CloseSquareOutlined, DeleteOutlined } from "@ant-design/icons";
import { calculateTreeResults } from "@/calculateTreeResults";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";

export interface SavedSetting {
  timestamp: number;
  productToProduce: string;
  wantedOutputRate: number;
  selectedRecipes: string[];
  dedicatedProducts: string[];
}

export const FactoryPlanner = (props: {
  productToProduce: string;
  wantedOutputRate: number;
  selectedRecipes: string[];
  dedicatedProducts: string[];
  setProductToProduce: (productToProduce: string) => void;
  setWantedOutputRate: (wantedOutputRate: number) => void;
  setSelectedRecipes: (selectedRecipes: string[]) => void;
  setDedicatedProducts: (products: string[]) => void;
}) => {
  const [savedSettings, setSavedSettings] = useLocalStorage<SavedSetting[]>(
    "saved-settings",
    []
  );
  const [clickedFactoryId, setClickedFactory] = useState<number>();
  const [hoveredFactoryId, setHoveredFactory] = useState<number>();
  const onChooseSavedSetting = (timestamp: number) => {
    const setting = savedSettings.find((x) => x.timestamp === timestamp)!;
    setClickedFactory(timestamp);
    props.setProductToProduce(setting.productToProduce);
    props.setWantedOutputRate(setting.wantedOutputRate);
    props.setSelectedRecipes(setting.selectedRecipes);
    props.setDedicatedProducts(setting.dedicatedProducts ?? []);
  };
  const onSave = () => {
    if (clickedFactoryId) {
      const current = savedSettings.find(
        (x) => x.timestamp === clickedFactoryId
      )!;
      current.productToProduce = props.productToProduce;
      current.wantedOutputRate = props.wantedOutputRate;
      current.selectedRecipes = props.selectedRecipes;
      current.dedicatedProducts = props.dedicatedProducts;
      setSavedSettings([...savedSettings]);
    } else {
      const now = Date.now();
      setSavedSettings([
        ...savedSettings,
        {
          timestamp: now,
          productToProduce: props.productToProduce,
          wantedOutputRate: props.wantedOutputRate,
          selectedRecipes: props.selectedRecipes,
          dedicatedProducts: props.dedicatedProducts,
        },
      ]);
      setClickedFactory(now);
    }
  };
  const factoryDetails = calculateFactoryDetails(savedSettings);
  const { productRates } = calculateTreeResults(
    props.productToProduce,
    props.wantedOutputRate,
    props.selectedRecipes,
    allRecipes
  );
  const newFactory: FactoryDetails = {
    output: { product: props.productToProduce, rate: props.wantedOutputRate },
    timestamp: Date.now(),
    input: [],
    sourceFactories: [],
    targetFactories: [],
  };
  productRates.forEach((value, product) => {
    if (value.type === "RESOURCE") {
      newFactory.input.push({ product, rate: value.rate });
    }
  });
  for (const otherFactory of factoryDetails) {
    const target = otherFactory.input.find(
      (x) => x.product === props.productToProduce
    );
    if (target) {
      newFactory.targetFactories.push({
        timestamp: otherFactory.timestamp,
        rate: target.rate,
        product: otherFactory.output.product,
      });
    }
    const source = newFactory.input.find(
      (x) => x.product === otherFactory.output.product
    );
    if (source) {
      newFactory.sourceFactories.push({
        timestamp: otherFactory.timestamp,
        product: otherFactory.output.product,
        rate: otherFactory.output.rate,
      });
    }
  }
  return (
    <CustomCard title="Factory planner">
      <Form.Item label="Save settings">
        <Button onClick={onSave}>Save</Button>
      </Form.Item>
      <SavedFactories
        factoryDetails={factoryDetails}
        selectedFactoryId={clickedFactoryId}
        savedSettings={savedSettings}
        setSavedSettings={setSavedSettings}
        onChooseSavedSetting={onChooseSavedSetting}
        onMouseEnter={setHoveredFactory}
        onMouseLeave={() => setHoveredFactory(undefined)}
      />
      <Button
        onClick={() => {
          const timestamp = Date.now();
          setSavedSettings([
            ...savedSettings,
            {
              timestamp,
              productToProduce: "",
              wantedOutputRate: 0,
              selectedRecipes: [],
              dedicatedProducts: [],
            },
          ]);
          setClickedFactory(timestamp);
        }}
      >
        Create new factory
      </Button>
      <div style={{ display: "flex" }}>
        <CustomCard>
          <Button
            onClick={() => {
              setClickedFactory(undefined);
              setSavedSettings(
                savedSettings.filter((x) => x.timestamp !== clickedFactoryId)
              );
            }}
          >
            <DeleteOutlined />
          </Button>
          <Button onClick={() => setClickedFactory(undefined)}>
            <CloseSquareOutlined />
          </Button>
          <DetailedView
            factoryDetails={
              clickedFactoryId
                ? factoryDetails.find((x) => x.timestamp === clickedFactoryId)!
                : newFactory
            }
          />
        </CustomCard>
        {hoveredFactoryId && hoveredFactoryId !== clickedFactoryId && (
          <CustomCard>
            <DetailedView
              factoryDetails={
                factoryDetails.find((x) => x.timestamp === hoveredFactoryId)!
              }
            />
          </CustomCard>
        )}
      </div>
    </CustomCard>
  );
};
