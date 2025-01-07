import { Button, Collapse, Form, Switch, Table } from "antd";
import { useLocalStorage } from "../reusableComp/useLocalStorage";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { calculateTreeResults } from "@/calculateTreeResults";
import { allRecipes } from "@/parseGameData/allRecipesFromConfig";
import { DeleteOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { CustomCard } from "@/reusableComp/CustomCard";
import { ContainerOverlay } from "@/reusableComp/ContainerOverlay";
import { useState } from "react";

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
  const [expandedView, setExpandedView] = useState(false);
  const onChooseSavedSetting = (timestamp: number) => {
    const setting = savedSettings.find((x) => x.timestamp === timestamp)!;
    props.setProductToProduce(setting.productToProduce);
    props.setWantedOutputRate(setting.wantedOutputRate);
    props.setSelectedRecipes(setting.selectedRecipes);
    props.setDedicatedProducts(setting.dedicatedProducts ?? []);
  };
  const resourceRatesPerFactory: {
    timestamp: number;
    output: { product: string; rate: number };
    input: { product: string; rate: number }[];
  }[] = [];
  const accumulatedRates: Map<string, number> = new Map();
  const addRate = (product: string, rate: number) => {
    const existing = accumulatedRates.get(product);
    accumulatedRates.set(product, (existing ?? 0) + rate);
  };
  savedSettings.forEach((setting) => {
    addRate(setting.productToProduce, setting.wantedOutputRate);
    const { productRates } = calculateTreeResults(
      setting.productToProduce,
      setting.wantedOutputRate,
      setting.selectedRecipes,
      allRecipes
    );
    const input: { product: string; rate: number }[] = [];
    productRates.forEach((value, product) => {
      if (value.type === "RESOURCE") {
        input.push({ product, rate: value.rate });
        addRate(product, -value.rate);
      }
    });
    resourceRatesPerFactory.push({
      timestamp: setting.timestamp,
      output: {
        product: setting.productToProduce,
        rate: setting.wantedOutputRate,
      },
      input,
    });
  });
  return (
    <CustomCard title="Saved factories">
      <Form.Item label="Expand view">
        <Switch checked={expandedView} onChange={setExpandedView} />
      </Form.Item>
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
      {expandedView ? (
        <Table
          size="small"
          pagination={false}
          columns={[
            {
              title: "Load / Delete",
              dataIndex: "action",
              render: (_, record) => (
                <div style={{ display: "flex" }}>
                  <Button
                    onClick={() => onChooseSavedSetting(record.timestamp)}
                  >
                    <PlayCircleOutlined />
                  </Button>
                  <Button
                    onClick={() =>
                      setSavedSettings(
                        savedSettings.filter(
                          (x) => x.timestamp !== record.timestamp
                        )
                      )
                    }
                  >
                    <DeleteOutlined />
                  </Button>
                </div>
              ),
            },
            {
              title: "Output",
              dataIndex: "output",
              render: (x: { product: string; rate: number }) => (
                <div style={{ display: "flex", alignItems: "center" }}>
                  {Math.round(x.rate * 10000) / 10000}
                  {"/min"}
                  <IconWithTooltip item={x.product} />
                </div>
              ),
            },
            {
              title: "Input",
              dataIndex: "input",
              render: (resources: { product: string; rate: number }[]) => (
                <div style={{ display: "flex" }}>
                  {resources.map((x) => (
                    <div
                      key={x.product}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "solid grey",
                        borderWidth: 0.5,
                        borderRadius: 8,
                        marginRight: 2,
                        padding: 1,
                      }}
                    >
                      {Math.round(x.rate * 100) / 100}
                      {"/min"}
                      <IconWithTooltip item={x.product} />
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
          dataSource={resourceRatesPerFactory.map((factory) => ({
            key: factory.timestamp,
            ...factory,
          }))}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {savedSettings.map((setting) => (
            <SavedSettingsButton
              key={setting.timestamp}
              setting={setting}
              onSelect={() => onChooseSavedSetting(setting.timestamp)}
              onDelete={() => {
                setSavedSettings(
                  savedSettings.filter((x) => x.timestamp !== setting.timestamp)
                );
              }}
            />
          ))}
        </div>
      )}
      <CustomCard title="Needed products">
        <div style={{ display: "flex" }}>
          {[...accumulatedRates.entries()]
            .filter((x) => x[1] < 0)
            .map(([product, rate]) => (
              <div key={product}>
                {Math.round(rate * 100) / 100}
                {"/min"}
                <IconWithTooltip item={product} />
              </div>
            ))}
        </div>
      </CustomCard>
      <CustomCard title="Produced products">
        <div style={{ display: "flex" }}>
          {[...accumulatedRates.entries()]
            .filter((x) => x[1] > 0)
            .map(([product, rate]) => (
              <div key={product}>
                {Math.round(rate * 100) / 100}
                {"/min"}
                <IconWithTooltip item={product} />
              </div>
            ))}
        </div>
      </CustomCard>
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
        <IconWithTooltip item={props.setting.productToProduce} />
      </Button>
    </ContainerOverlay>
  );
};
