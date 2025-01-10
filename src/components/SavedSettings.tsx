import { Button, Form } from "antd";
import { useLocalStorage } from "../reusableComp/useLocalStorage";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { calculateTreeResults } from "@/calculateTreeResults";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";
import { CustomCard } from "@/reusableComp/CustomCard";
import { useState } from "react";
import { SavedFactories } from "./SavedFactories";
import { DetailedView } from "./DetailedView";

export interface SavedSetting {
  timestamp: number;
  productToProduce: string;
  wantedOutputRate: number;
  selectedRecipes: string[];
  dedicatedProducts: string[];
}

export const SavedSettings = (props: {
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
  const [clickedFactory, setClickedFactory] = useState<number>();
  const [hoveredFactory, setHoveredFactory] = useState<number>();
  const onChooseSavedSetting = (timestamp: number) => {
    const setting = savedSettings.find((x) => x.timestamp === timestamp)!;
    setClickedFactory(timestamp);
    props.setProductToProduce(setting.productToProduce);
    props.setWantedOutputRate(setting.wantedOutputRate);
    props.setSelectedRecipes(setting.selectedRecipes);
    props.setDedicatedProducts(setting.dedicatedProducts ?? []);
  };
  const onSave = () => {
    if (clickedFactory) {
      const current = savedSettings.find(
        (x) => x.timestamp === clickedFactory
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
  const resourceRatesPerFactory: {
    timestamp: number;
    output: { product: string; rate: number };
    input: { product: string; rate: number }[];
  }[] = [];
  const accumulatedRates: Map<string, number> = new Map();
  const addRate = (product: string, rate: number) => {
    const existing = accumulatedRates.get(product);
    accumulatedRates.set(product, (existing ?? 0) + rate);
  };
  savedSettings.forEach((setting) => {
    addRate(setting.productToProduce, setting.wantedOutputRate);
    const { productRates } = calculateTreeResults(
      setting.productToProduce,
      setting.wantedOutputRate,
      setting.selectedRecipes,
      allRecipes
    );
    const input: { product: string; rate: number }[] = [];
    productRates.forEach((value, product) => {
      if (value.type === "RESOURCE") {
        input.push({ product, rate: value.rate });
        addRate(product, -value.rate);
      }
    });
    resourceRatesPerFactory.push({
      timestamp: setting.timestamp,
      output: {
        product: setting.productToProduce,
        rate: setting.wantedOutputRate,
      },
      input,
    });
  });
  const targetFactoriesOfOutput: {
    timestamp: number;
    targetFactories: {
      timestamp: number;
      neededRate: number;
      product: string;
    }[];
    sourceFactories: {
      timestamp: number;
      product: string;
    }[];
  }[] = [];
  for (const currentFactory of resourceRatesPerFactory) {
    const targetFactories: {
      timestamp: number;
      neededRate: number;
      product: string;
    }[] = [];
    const sourceFactories: { timestamp: number; product: string }[] = [];
    for (const targetFactory of resourceRatesPerFactory) {
      const targetNeededRate = targetFactory.input.find(
        (x) => x.product === currentFactory.output.product
      );
      if (targetNeededRate) {
        targetFactories.push({
          timestamp: targetFactory.timestamp,
          neededRate: targetNeededRate.rate,
          product: targetFactory.output.product,
        });
      }
      const source = currentFactory.input.find(
        (x) => x.product === targetFactory.output.product
      );
      if (source) {
        sourceFactories.push({
          timestamp: targetFactory.timestamp,
          product: targetFactory.output.product,
        });
      }
    }
    targetFactoriesOfOutput.push({
      timestamp: currentFactory.timestamp,
      targetFactories,
      sourceFactories,
    });
  }
  return (
    <CustomCard title="Saved factories">
      <Form.Item label="Save settings">
        <Button onClick={onSave}>Save</Button>
      </Form.Item>
      <Form.Item label="Expand view"></Form.Item>
      <SavedFactories
        selectedFactory={clickedFactory}
        targetFactories={
          targetFactoriesOfOutput
            .find((x) => x.timestamp === clickedFactory)
            ?.targetFactories.map((x) => x.timestamp) ?? []
        }
        sourceFactories={
          targetFactoriesOfOutput
            .find((x) => x.timestamp === clickedFactory)
            ?.sourceFactories.map((x) => x.timestamp) ?? []
        }
        savedSettings={savedSettings}
        accumulatedRates={accumulatedRates}
        setSavedSettings={setSavedSettings}
        onChooseSavedSetting={onChooseSavedSetting}
        onMouseEnter={setHoveredFactory}
        onMouseLeave={() => setHoveredFactory(undefined)}
      />
      <DetailedView
        onClose={() => setClickedFactory(undefined)}
        onDelete={() =>
          setSavedSettings(
            savedSettings.filter((x) => x.timestamp !== clickedFactory)
          )
        }
        resourceRates={
          resourceRatesPerFactory.find(
            (x) => x.timestamp === (hoveredFactory ?? clickedFactory)
          )!
        }
        targetFactories={
          targetFactoriesOfOutput.find(
            (x) => x.timestamp === (hoveredFactory ?? clickedFactory)
          )?.targetFactories??[]
        }
      />
      <CustomCard title="Needed resources">
        <div style={{ display: "flex" }}>
          {[...accumulatedRates.entries()]
            .filter(
              (x) =>
                !savedSettings.find(
                  (setting) => setting.productToProduce === x[0]
                )
            )
            .map(([product, rate]) => (
              <div key={product}>
                {Math.round(rate * 100) / 100}
                {"/min"}
                <IconWithTooltip item={product} />
              </div>
            ))}
        </div>
      </CustomCard>
    </CustomCard>
  );
};
