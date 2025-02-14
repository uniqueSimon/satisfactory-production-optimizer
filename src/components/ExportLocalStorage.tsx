import { SavedFactory } from "./factoryPlanner/FactoryPlanner";

const exportJson = (json: {
  savedFactories: SavedFactory[][];
  foundAltRecipes: string[];
}) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(json)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "data.json";
  link.click();
};

export const ExportLocalStorage = (props: {
  savedFactories: SavedFactory[][];
  foundAltRecipes: string[];
}) => {
  const handleClick = () => exportJson(props);
  return (
    <button onClick={handleClick}>
      Export local storage (Stores saved factories and found alternate recipes
      in a json-file)
    </button>
  );
};
