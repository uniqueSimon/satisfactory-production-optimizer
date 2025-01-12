import { Button, Form, Select } from "antd";
import { useLocalStorage } from "../../reusableComp/useLocalStorage";
import { CustomCard } from "@/reusableComp/CustomCard";
import { useState } from "react";
import { SavedFactories } from "./SavedFactories";
import { DetailedView } from "./DetailedView";
import { calculateFactoryDetails } from "./calculateFactoryDetails";
import { CloseSquareOutlined, DeleteOutlined } from "@ant-design/icons";
import { NeededResources } from "../NeededRessources";
import { EfficientTreeSelection } from "../EfficientTreeSelection";
import { Recipe } from "@/App";
import { ProductToProduce } from "../ProductToProduce";
import { OutputRate } from "../OutputRate";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";
import { DedicatedProducts } from "../DedicatedProducts";

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
  const [clickedFactoryId, setClickedFactory] = useState<number>();
  const [hoveredFactoryId, setHoveredFactory] = useState<number>();
  const factoryDetails = calculateFactoryDetails(savedSettings);
  const selectedFactory = factoryDetails.find(
    (x) => x.timestamp === clickedFactoryId
  );
  const selectedSavedSettings = savedSettings.find(
    (x) => x.timestamp === clickedFactoryId
  );
  const rootRecipe = selectedSavedSettings
    ? props.availableRecipes.find(
        (x) =>
          x.product.name === selectedSavedSettings.productToProduce &&
          selectedSavedSettings.selectedRecipes.includes(x.recipeName)
      )
    : undefined;
  return (
    <CustomCard title="Factory planner">
      <SavedFactories
        factoryDetails={factoryDetails}
        selectedFactoryId={clickedFactoryId}
        savedSettings={savedSettings}
        setSavedSettings={setSavedSettings}
        onChooseSavedSetting={setClickedFactory}
        onMouseEnter={setHoveredFactory}
        onMouseLeave={() => setHoveredFactory(undefined)}
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
          setClickedFactory(timestamp);
        }}
      />
      <div style={{ display: "flex" }}>
        {selectedFactory && (
          <>
            <CustomCard>
              <Button
                onClick={() => {
                  setClickedFactory(undefined);
                  setSavedSettings(
                    savedSettings.filter(
                      (x) => x.timestamp !== clickedFactoryId
                    )
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
                  factoryDetails.find((x) => x.timestamp === clickedFactoryId)!
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
                factoryDetails.find((x) => x.timestamp === hoveredFactoryId)!
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
                wantedOutputRate={selectedSavedSettings.wantedOutputRate}
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
