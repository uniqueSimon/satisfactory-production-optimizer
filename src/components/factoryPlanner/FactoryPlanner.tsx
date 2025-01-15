import { Button, Form, Select } from "antd";
import { useLocalStorage } from "../../reusableComp/useLocalStorage";
import { CustomCard } from "@/reusableComp/CustomCard";
import { useEffect, useRef, useState } from "react";
import { SavedFactories } from "./SavedFactories";
import { DetailedView } from "./DetailedView";
import { calculateFactoryDetails } from "./calculateFactoryDetails";
import {
  CloseSquareOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { NeededResources } from "../NeededRessources";
import { EfficientTreeSelection } from "../EfficientTreeSelection";
import { Recipe } from "@/App";
import { ProductToProduce } from "../ProductToProduce";
import { OutputRate } from "../OutputRate";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";
import { DedicatedProducts } from "../DedicatedProducts";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

export interface SavedSetting {
  timestamp: number;
  productToProduce: string;
  wantedOutputRate: number;
  selectedRecipes: string[];
  dedicatedProducts: string[];
}

export const FactoryPlanner = (props: { availableRecipes: Recipe[] }) => {
  const [savedSettings, setSavedSettings] = useLocalStorage<SavedSetting[]>(
    "saved-settings",
    []
  );
  const [savedSettingsSeparate, setSavedSettingsSeparate] = useLocalStorage<
    SavedSetting[]
  >("saved-settings-separate", []);
  const [clickedFactoryId, setClickedFactoryId] = useState<number>();
  const [hoveredFactoryId, setHoveredFactoryId] = useState<number>();
  const combinedSavedSettings = [...savedSettings, ...savedSettingsSeparate];
  const combinedFactoryDetails = calculateFactoryDetails(combinedSavedSettings);
  const factoryDetails = combinedFactoryDetails.slice(0, savedSettings.length);
  const factoryDetailsSeparate = combinedFactoryDetails.slice(
    savedSettings.length
  );
  const selectedFactory = combinedFactoryDetails.find(
    (x) => x.timestamp === clickedFactoryId
  );
  const selectedSavedSettings = combinedSavedSettings.find(
    (x) => x.timestamp === clickedFactoryId
  );
  const rootRecipe = selectedSavedSettings
    ? props.availableRecipes.find(
        (x) =>
          x.product.name === selectedSavedSettings.productToProduce &&
          selectedSavedSettings.selectedRecipes.includes(x.recipeName)
      )
    : undefined;
  const insertCard1 = (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => {
    const sourceItem = savedSettings.find((x) => x.timestamp === sourceId);
    if (!sourceItem) {
      return;
    }
    const targetIndex = savedSettings.findIndex(
      (x) => x.timestamp === targetId
    );
    const insertionIndex =
      closestEdge === "left" ? targetIndex : targetIndex + 1;
    const firstPart = savedSettings
      .slice(0, insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    const lastPart = savedSettings
      .slice(insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    setSavedSettings([...firstPart, sourceItem, ...lastPart]);
  };
  const insertCard2 = (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => {
    const sourceItem = savedSettingsSeparate.find(
      (x) => x.timestamp === sourceId
    )!;
    if (!sourceItem) {
      return;
    }
    const targetIndex = savedSettingsSeparate.findIndex(
      (x) => x.timestamp === targetId
    );
    const insertionIndex =
      closestEdge === "left" ? targetIndex : targetIndex + 1;
    const firstPart = savedSettingsSeparate
      .slice(0, insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    const lastPart = savedSettingsSeparate
      .slice(insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    setSavedSettingsSeparate([...firstPart, sourceItem, ...lastPart]);
  };
  const refDropable1 = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = refDropable1.current!;
    const cleanupDropTarget = dropTargetForElements({
      element,
      canDrop: ({ source }) =>
        savedSettingsSeparate.some((x) => x.timestamp === source.data.id),
      onDrop: ({ source }) => {
        setSavedSettings([
          ...savedSettings,
          savedSettingsSeparate.find((x) => x.timestamp === source.data.id)!,
        ]);
        setSavedSettingsSeparate(
          savedSettingsSeparate.filter((x) => x.timestamp !== source.data.id)
        );
      },
    });
    return () => {
      cleanupDropTarget();
    };
  }, [savedSettings, savedSettingsSeparate]);
  const refDropable2 = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = refDropable2.current!;
    const cleanupDropTarget = dropTargetForElements({
      element,
      canDrop: ({ source }) =>
        savedSettings.some((x) => x.timestamp === source.data.id),

      onDrop: ({ source }) => {
        setSavedSettingsSeparate([
          ...savedSettingsSeparate,
          savedSettings.find((x) => x.timestamp === source.data.id)!,
        ]);
        setSavedSettings(
          savedSettings.filter((x) => x.timestamp !== source.data.id)
        );
      },
    });
    return () => {
      cleanupDropTarget();
    };
  }, [savedSettings, savedSettingsSeparate]);
  return (
    <CustomCard title="Factory planner">
      <SavedFactories
        dropableRef={refDropable1}
        onInsertCard={insertCard1}
        factoryDetails={factoryDetails}
        selectedFactoryId={clickedFactoryId}
        savedSettings={savedSettings}
        setSavedSettings={setSavedSettings}
        onChooseSavedSetting={setClickedFactoryId}
        onMouseEnter={setHoveredFactoryId}
        onMouseLeave={() => setHoveredFactoryId(undefined)}
        onAddNew={() => {
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
          setClickedFactoryId(timestamp);
        }}
      />
      <SavedFactories
        dropableRef={refDropable2}
        onInsertCard={insertCard2}
        factoryDetails={factoryDetailsSeparate}
        selectedFactoryId={clickedFactoryId}
        savedSettings={savedSettingsSeparate}
        setSavedSettings={setSavedSettingsSeparate}
        onChooseSavedSetting={setClickedFactoryId}
        onMouseEnter={setHoveredFactoryId}
        onMouseLeave={() => setHoveredFactoryId(undefined)}
        onAddNew={() => {
          const timestamp = Date.now();
          setSavedSettingsSeparate([
            ...savedSettingsSeparate,
            {
              timestamp,
              productToProduce: "",
              wantedOutputRate: 0,
              selectedRecipes: [],
              dedicatedProducts: [],
            },
          ]);
          setClickedFactoryId(timestamp);
        }}
      />
      <div style={{ display: "flex" }}>
        {selectedFactory && (
          <>
            <CustomCard>
              <Button
                onClick={() => {
                  setClickedFactoryId(undefined);
                  setSavedSettings(
                    savedSettings.filter(
                      (x) => x.timestamp !== clickedFactoryId
                    )
                  );
                  setSavedSettingsSeparate(
                    savedSettingsSeparate.filter(
                      (x) => x.timestamp !== clickedFactoryId
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
                onClick={() =>
                  setSavedSettings([
                    ...savedSettings,
                    { ...selectedSavedSettings!, timestamp: Date.now() },
                  ])
                }
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
                  setSavedSettings([...savedSettings]);
                }}
              />
              <OutputRate
                rootRecipe={rootRecipe}
                setWantedOutputRate={(wantedOutputRate) => {
                  selectedSavedSettings.wantedOutputRate = wantedOutputRate;
                  setSavedSettings([...savedSettings]);
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
                  setSavedSettings([...savedSettings]);
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
                  setSavedSettings([...savedSettings]);
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
              setSavedSettings([...savedSettings]);
            }}
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
                  setSavedSettings([...savedSettings]);
                }}
              />
            ))}
          </div>
        </>
      )}
    </CustomCard>
  );
};
