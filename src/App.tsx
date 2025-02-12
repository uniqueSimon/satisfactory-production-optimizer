import { Form, Select, Typography } from "antd";
import {
  FactoryPlanner,
  SavedFactory,
} from "./components/factoryPlanner/FactoryPlanner";
import { useLocalStorage } from "./reusableComp/useLocalStorage";
import { useState } from "react";
import { FactoryDetails } from "./components/factoryDetails/FactoryDetails";
import { calculateProductWeights, maxRates } from "./calculateProductWeights";
import { AlternateRecipes } from "./components/AlternateRecipes";

export const allProducts: string[] = [];
fetch("public/gameData/allProducts.json")
  .then((response) => response.json())
  .then((data) => allProducts.push(...data));

export const allRecipes: Recipe[] = [];
fetch("public/gameData/allRecipes.json")
  .then((response) => response.json())
  .then((data) => allRecipes.push(...data));

export const productDisplayNameMapping = new Map<string, string>();
fetch("public/gameData/displayNames.json")
  .then((response) => response.json())
  .then((data: [string, string][]) =>
    data.forEach((x) => productDisplayNameMapping.set(x[0], x[1]))
  );


export interface Recipe {
  recipeName: string;
  displayName: string;
  product: { name: string; amount: number };
  ingredients: { name: string; amount: number }[];
  time: number;
  isAlternate: boolean;
  producedIn: string;
  tier: number;
}

export const App = () => {
  const [savedFactories, setSavedFactories] = useLocalStorage<SavedFactory[][]>(
    "saved-factories",
    []
  );
  const [foundAltRecipes, setFoundAltRecipes] = useLocalStorage<string[]>(
    "found-alt-recipes",
    []
  );
  const [clickedFactoryId, setClickedFactoryId] = useState<number>();
  const [excludedResources, setExcludedResources] = useState([]);

  const combinedSavedFactories = savedFactories.flat();
  const selectedSavedSettings = combinedSavedFactories.find(
    (x) => x.id === clickedFactoryId
  );
  const allResources = [...maxRates.keys()];

  const weights = calculateProductWeights(excludedResources);

  const availableRecipes = allRecipes.filter(
    (x) => !x.isAlternate || foundAltRecipes.includes(x.recipeName)
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
        <FactoryPlanner
          clickedFactoryId={clickedFactoryId}
          savedFactories={savedFactories}
          setClickedFactoryId={setClickedFactoryId}
          setSavedFactories={setSavedFactories}
        />
        {selectedSavedSettings && (
          <FactoryDetails
            availableRecipes={availableRecipes}
            savedFactory={selectedSavedSettings}
            weights={weights}
            setSavedFactory={(savedFactory) =>
              setSavedFactories((prev) =>
                prev.map((cluster) =>
                  cluster.map((factory) =>
                    factory.id === clickedFactoryId ? savedFactory : factory
                  )
                )
              )
            }
          />
        )}
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
        <AlternateRecipes
          weights={weights}
          foundAltRecipes={foundAltRecipes}
          setFoundAltRecipes={setFoundAltRecipes}
        />
      </Form>
    </div>
  );
};
