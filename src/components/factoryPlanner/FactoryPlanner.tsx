import { Button, Form, Select } from "antd";
import { useLocalStorage } from "../../reusableComp/useLocalStorage";
import { CustomCard } from "@/reusableComp/CustomCard";
import { useState } from "react";
import { SavedFactories } from "./SavedFactories";
import { DetailedView } from "./DetailedView";
import {
  calculateFactoryDetails,
  FactoryDetails,
} from "./calculateFactoryDetails";
import {
  CloseSquareOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { NeededResources } from "../NeededRessources";
import { EfficientTreeSelection } from "../EfficientTreeSelection";
import { Recipe } from "@/App";
import { ProductToProduce } from "../ProductToProduce";
import { OutputRate } from "../OutputRate";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";
import { DedicatedProducts } from "../DedicatedProducts";
import { calculateProductWeights, maxRates } from "@/calculateProductWeights";

export interface SavedSetting {
  timestamp: number;
  productToProduce: string;
  wantedOutputRate: number;
  selectedRecipes: string[];
  dedicatedProducts: string[];
}

export const FactoryPlanner = (props: { availableRecipes: Recipe[] }) => {
  const [savedFactories, setSavedFactories] = useLocalStorage<SavedSetting[][]>(
    "saved-factories",
    []
  );
  const [clickedFactoryId, setClickedFactoryId] = useState<number>();
  const [hoveredFactoryId, setHoveredFactoryId] = useState<number>();
  const combinedSavedFactories = savedFactories.flat();
  const combinedFactoryDetails = calculateFactoryDetails(
    combinedSavedFactories
  );
  const factoryDetails: FactoryDetails[][] = [];
  let i = 0;
  for (const savedFactoryPart of savedFactories) {
    factoryDetails.push(
      combinedFactoryDetails.slice(i, savedFactoryPart.length + i)
    );
    i += savedFactoryPart.length;
  }
  const selectedFactory = combinedFactoryDetails.find(
    (x) => x.timestamp === clickedFactoryId
  );
  const selectedSavedSettings = combinedSavedFactories.find(
    (x) => x.timestamp === clickedFactoryId
  );
  const rootRecipe = selectedSavedSettings
    ? props.availableRecipes.find(
        (x) =>
          x.product.name === selectedSavedSettings.productToProduce &&
          selectedSavedSettings.selectedRecipes.includes(x.recipeName)
      )
    : undefined;
  const insertCard = (
    clusterIndex: number,
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => {
    const cluster = savedFactories[clusterIndex];
    const sourceItem = cluster.find((x) => x.timestamp === sourceId);
    if (!sourceItem) {
      return;
    }
    const targetIndex = cluster.findIndex((x) => x.timestamp === targetId);
    const insertionIndex =
      closestEdge === "left" ? targetIndex : targetIndex + 1;
    const firstPart = cluster
      .slice(0, insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    const lastPart = cluster
      .slice(insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    savedFactories[clusterIndex] = [...firstPart, sourceItem, ...lastPart];
    setSavedFactories([...savedFactories]);
  };

  const [excludedResources, setExcludedResources] = useState([]);
  const weights = calculateProductWeights(excludedResources);
  const allResources = [...maxRates.keys()];
  return (
    <CustomCard title="Factory planner">
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
      {savedFactories.map((cluster, index) => (
        <SavedFactories
          key={index}
          onInsertCard={(...arg) => insertCard(index, ...arg)}
          factoryDetails={factoryDetails[index] ?? []}
          selectedFactoryId={clickedFactoryId}
          cluster={cluster}
          setSavedSettings={(factories) => {
            savedFactories[index] = factories;
            setSavedFactories([...savedFactories]);
          }}
          onChooseSavedSetting={setClickedFactoryId}
          onMouseEnter={setHoveredFactoryId}
          onMouseLeave={() => setHoveredFactoryId(undefined)}
          onAddNew={() => {
            const timestamp = Date.now();
            savedFactories[index] = [
              ...(savedFactories[index] ?? []),
              {
                timestamp,
                productToProduce: "",
                wantedOutputRate: 0,
                selectedRecipes: [],
                dedicatedProducts: [],
              },
            ];
            setSavedFactories([...savedFactories]);
            setClickedFactoryId(timestamp);
          }}
          onDropIntoCluster={(sourceId) => {
            setSavedFactories((prev) => {
              const sourceFactory = prev
                .flat()
                .find((x) => x.timestamp === sourceId)!;
              const withoutSource = prev.map((cluster) =>
                cluster.filter((x) => x.timestamp !== sourceId)
              );
              withoutSource[index].push(sourceFactory);
              return [...withoutSource];
            });
          }}
          onRemoveCluster={() =>
            setSavedFactories((prev) => [...prev.filter((_, i) => i !== index)])
          }
        />
      ))}
      <Button onClick={() => setSavedFactories((prev) => [...prev, []])}>
        <PlusSquareOutlined />
        Add factory cluster
      </Button>
      <div style={{ display: "flex" }}>
        {selectedFactory && (
          <>
            <CustomCard>
              <Button
                onClick={() => {
                  setClickedFactoryId(undefined);
                  setSavedFactories(
                    savedFactories.map((part) =>
                      part.filter((x) => x.timestamp !== clickedFactoryId)
                    )
                  );
                }}
              >
                <DeleteOutlined />
              </Button>
              <Button onClick={() => setClickedFactoryId(undefined)}>
                <CloseSquareOutlined />
              </Button>
              <Button
                onClick={() => {
                  const timestamp = Date.now();
                  const clusterIndex = savedFactories.findIndex((x) =>
                    x.some((y) => y.timestamp === clickedFactoryId)
                  );
                  const source = savedFactories[clusterIndex].find(
                    (x) => x.timestamp === clickedFactoryId
                  )!;
                  savedFactories[clusterIndex].push({ ...source, timestamp });
                  setClickedFactoryId(timestamp);
                }}
              >
                <CopyOutlined />
              </Button>
              <DetailedView
                factoryDetails={
                  combinedFactoryDetails.find(
                    (x) => x.timestamp === clickedFactoryId
                  )!
                }
              />
            </CustomCard>
            <NeededResources machines={selectedFactory.machines} />
          </>
        )}
        {hoveredFactoryId && hoveredFactoryId !== clickedFactoryId && (
          <CustomCard>
            <DetailedView
              factoryDetails={
                combinedFactoryDetails.find(
                  (x) => x.timestamp === hoveredFactoryId
                )!
              }
            />
          </CustomCard>
        )}
      </div>
      {selectedFactory && selectedSavedSettings && (
        <>
          <CustomCard>
            <div style={{ display: "flex" }}>
              <ProductToProduce
                productToProduce={selectedSavedSettings.productToProduce}
                setProductToProduce={(product) => {
                  selectedSavedSettings.selectedRecipes = [];
                  selectedSavedSettings.dedicatedProducts = [];
                  selectedSavedSettings.productToProduce = product;
                  setSavedFactories([...savedFactories]);
                }}
              />
              <OutputRate
                rootRecipe={rootRecipe}
                setWantedOutputRate={(wantedOutputRate) => {
                  selectedSavedSettings.wantedOutputRate = wantedOutputRate;
                  setSavedFactories([...savedFactories]);
                }}
                wantedOutputRate={selectedSavedSettings.wantedOutputRate}
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
                value={selectedSavedSettings.selectedRecipes}
                onChange={(selectedRecipes) => {
                  selectedSavedSettings.selectedRecipes = selectedRecipes;
                  setSavedFactories([...savedFactories]);
                }}
              />
            </Form.Item>
            {selectedSavedSettings.productToProduce && (
              <DedicatedProducts
                currentProducts={[...selectedFactory.productRates.entries()]
                  .filter((x) => x[1].type === "MULTIPLE")
                  .map((x) => x[0])}
                dedicatedProducts={selectedSavedSettings.dedicatedProducts}
                setDedicatedProducts={(dedicatedProducts) => {
                  selectedSavedSettings.dedicatedProducts = dedicatedProducts;
                  setSavedFactories([...savedFactories]);
                }}
              />
            )}
          </CustomCard>
          <EfficientTreeSelection
            dedicatedProducts={selectedSavedSettings.dedicatedProducts ?? []}
            productToProduce={selectedSavedSettings.productToProduce}
            selectedRecipes={selectedSavedSettings.selectedRecipes}
            availableRecipes={props.availableRecipes}
            wantedOutputRate={selectedSavedSettings.wantedOutputRate}
            setSelectedRecipes={(selectedRecipes) => {
              selectedSavedSettings.selectedRecipes = selectedRecipes;
              setSavedFactories([...savedFactories]);
            }}
            weights={weights}
          />
          <div style={{ display: "flex" }}>
            {(selectedSavedSettings.dedicatedProducts ?? []).map((product) => (
              <EfficientTreeSelection
                key={product}
                dedicatedProducts={selectedSavedSettings.dedicatedProducts}
                productToProduce={product}
                selectedRecipes={selectedSavedSettings.selectedRecipes}
                availableRecipes={props.availableRecipes}
                wantedOutputRate={
                  selectedFactory.productRates.get(product)!.rate
                }
                setSelectedRecipes={(selectedRecipes) => {
                  selectedSavedSettings.selectedRecipes = selectedRecipes;
                  setSavedFactories([...savedFactories]);
                }}
                weights={weights}
              />
            ))}
          </div>
        </>
      )}
    </CustomCard>
  );
};
