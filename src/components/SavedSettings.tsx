import { Button, Form, Switch } from "antd";
import { useLocalStorage } from "../reusableComp/useLocalStorage";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { calculateTreeResults } from "@/calculateTreeResults";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";
import { CustomCard } from "@/reusableComp/CustomCard";
import { useState } from "react";
import { SavedFactories } from "./SavedFactories";
import { ExpandedView } from "./ExpandedView";
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
  const [expandedView, setExpandedView] = useState(false);
  const onChooseSavedSetting = (timestamp: number) => {
    const setting = savedSettings.find((x) => x.timestamp === timestamp)!;
    setClickedFactory(timestamp);
    props.setProductToProduce(setting.productToProduce);
    props.setWantedOutputRate(setting.wantedOutputRate);
    props.setSelectedRecipes(setting.selectedRecipes);
    props.setDedicatedProducts(setting.dedicatedProducts ?? []);
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
  return (
    <CustomCard title="Saved factories">
      <Form.Item label="Save settings">
        <Button
          onClick={() => {
            setSavedSettings([
              ...savedSettings,
              {
                timestamp: Date.now(),
                productToProduce: props.productToProduce,
                wantedOutputRate: props.wantedOutputRate,
                selectedRecipes: props.selectedRecipes,
                dedicatedProducts: props.dedicatedProducts,
              },
            ]);
          }}
        >
          Save
        </Button>
      </Form.Item>
      <Form.Item label="Expand view">
        <Switch checked={expandedView} onChange={setExpandedView} />
      </Form.Item>
      {expandedView ? (
        <ExpandedView
          onChooseSavedSetting={onChooseSavedSetting}
          resourceRatesPerFactory={resourceRatesPerFactory}
          savedSettings={savedSettings}
          setSavedSettings={setSavedSettings}
        />
      ) : (
        <SavedFactories
          savedSettings={savedSettings}
          accumulatedRates={accumulatedRates}
          setSavedSettings={setSavedSettings}
          onChooseSavedSetting={onChooseSavedSetting}
          onMouseEnter={setHoveredFactory}
          onMouseLeave={() => setHoveredFactory(undefined)}
        />
      )}
      <DetailedView
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
