import { Button, Form, Tooltip } from "antd";
import { useLocalStorage } from "../reusableComp/useLocalStorage";
import { productDisplayNameMapping } from "../parseGameData/getProductDisplayNames";
import { ContainerOverlay } from "../reusableComp/ContainerOverlay";
import { CustomCard } from "@/reusableComp/CustomCard";

interface SavedSetting {
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
  const onChooseSavedSetting = (setting: SavedSetting) => {
    props.setProductToProduce(setting.productToProduce);
    props.setWantedOutputRate(setting.wantedOutputRate);
    props.setSelectedRecipes(setting.selectedRecipes);
    props.setDedicatedProducts(setting.dedicatedProducts ?? []);
  };
  return (
    <CustomCard title="Local storage">
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
      <Form.Item label="Choose saved settings">
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {savedSettings.map((setting) => (
            <SavedSettingsButton
              key={setting.timestamp}
              setting={setting}
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
    </CustomCard>
  );
};

const SavedSettingsButton = (props: {
  setting: SavedSetting;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  return (
    <ContainerOverlay icon="CLOSE" onClick={props.onDelete}>
      <Button
        onClick={props.onSelect}
        style={{ display: "flex", alignItems: "center", margin: 1 }}
      >
        {props.setting.wantedOutputRate}x
        <Tooltip
          title={productDisplayNameMapping.get(props.setting.productToProduce)}
        >
          <img
            src={`items/desc-${props.setting.productToProduce
              .toLowerCase()
              .replace("_", "-")}-c_64.png`}
            style={{ height: 30, marginLeft: 5 }}
          />
        </Tooltip>
      </Button>
    </ContainerOverlay>
  );
};
