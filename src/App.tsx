import { Form, Typography } from "antd";
import { allRecipes } from "./parseGameData/allRecipesFromConfig";
import { useLocalStorage } from "./reusableComp/useLocalStorage";
import { FactoryPlanner } from "./components/factoryPlanner/FactoryPlanner";
import { AlternateRecipes } from "./components/AlternateRecipes";

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
  const [foundAltRecipes, setFoundAltRecipes] = useLocalStorage<string[]>(
    "found-alt-recipes",
    []
  );
  /* const availableRecipes = allRecipes.filter(
    (x) => !x.isAlternate || foundAltRecipes.includes(x.recipeName)
  ); */
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
        <FactoryPlanner availableRecipes={allRecipes/* availableRecipes */} />
        <AlternateRecipes
          foundAltRecipes={foundAltRecipes}
          setFoundAltRecipes={setFoundAltRecipes}
        />
      </Form>
    </div>
  );
};
