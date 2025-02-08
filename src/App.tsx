import { Form, Typography } from "antd";
import {
  FactoryPlanner,
  SavedFactory,
} from "./components/factoryPlanner/FactoryPlanner";
import { useLocalStorage } from "./reusableComp/useLocalStorage";
import { useState } from "react";
import { FactoryDetails } from "./components/factoryDetails/FactoryDetails";

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
  const [clickedFactoryId, setClickedFactoryId] = useState<number>();
  const combinedSavedFactories = savedFactories.flat();
  const selectedSavedSettings = combinedSavedFactories.find(
    (x) => x.id === clickedFactoryId
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
            savedFactory={selectedSavedSettings}
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
      </Form>
    </div>
  );
};
