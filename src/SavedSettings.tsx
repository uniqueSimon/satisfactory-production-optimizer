import { Button, Form } from "antd";
import { useLocalStorage } from "./useLocalStorage";
import { SavedSettingsButton } from "./SavedSettingsButton";
import { productDisplayNameMapping } from "./getProductDisplayNames";

interface SavedSetting {
  timestamp: number;
  productToProduce: string;
  wantedOutputRate: number;
  inputProducts: string[];
  selectedAltRecipes: string[];
}

export const SavedSettings = (props: {
  productToProduce: string;
  wantedOutputRate: number;
  inputProducts: string[];
  selectedAltRecipes: string[];
  setProductToProduce: (productToProduce: string) => void;
  setWantedOutputRate: (wantedOutputRate: number) => void;
  setInputProducts: (inputProducts: string[]) => void;
  setSelectedAltRecipes: (selectedAltRecipes: string[]) => void;
}) => {
  const [savedSettings, setSavedSettings] = useLocalStorage<SavedSetting[]>(
    "saved-settings",
    []
  );
  const onChooseSavedSetting = (setting: SavedSetting) => {
    props.setProductToProduce(setting.productToProduce);
    props.setWantedOutputRate(setting.wantedOutputRate);
    props.setSelectedAltRecipes(setting.selectedAltRecipes);
    props.setInputProducts(setting.inputProducts);
  };
  return (
    <>
      <Form.Item label="Save settings">
        <Button
          onClick={() => {
            setSavedSettings([
              ...savedSettings,
              {
                timestamp: Date.now(),
                productToProduce: props.productToProduce,
                wantedOutputRate: props.wantedOutputRate,
                inputProducts: props.inputProducts,
                selectedAltRecipes: props.selectedAltRecipes,
              },
            ]);
          }}
        >
          Save
        </Button>
      </Form.Item>
      <Form.Item label="Choose saved settings">
        <div style={{ display: "flex" }}>
          {savedSettings.map((setting) => (
            <SavedSettingsButton
              key={setting.timestamp}
              label={`${setting.wantedOutputRate} ${productDisplayNameMapping.get(setting.productToProduce)!}`}
              onSelect={() => onChooseSavedSetting(setting)}
              onDelete={() => {
                setSavedSettings(
                  savedSettings.filter((x) => x.timestamp !== setting.timestamp)
                );
              }}
            />
          ))}
        </div>
      </Form.Item>
    </>
  );
};
