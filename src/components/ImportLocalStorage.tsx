import { SavedFactory } from "./factoryPlanner/FactoryPlanner";

export const ImportLocalStorage = (props: {
  setSavedFactories: (savedFactories: SavedFactory[][]) => void;
  setFoundAltRecipes: (foundAltRecipes: string[]) => void;
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = JSON.parse(e.target!.result as string);
        props.setSavedFactories(json.savedFactories);
        props.setFoundAltRecipes(json.foundAltRecipes);
      };
      reader.readAsText(file);
    }
  };
  return (
    <div>
      <p>
        Import into local storage (Imports saved factories and found alternate
        recipes from a json-file)
      </p>
      <input type="file" accept=".json" onChange={handleFileUpload} />
    </div>
  );
};
