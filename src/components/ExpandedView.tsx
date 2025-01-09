import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { DeleteOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Table } from "antd";
import { SavedSetting } from "./SavedSettings";

export const ExpandedView = (props: {
  savedSettings: SavedSetting[];
  onChooseSavedSetting: (timestamp: number) => void;
  setSavedSettings: (value: SavedSetting[]) => void;
  resourceRatesPerFactory: {
    timestamp: number;
    output: {
      product: string;
      rate: number;
    };
    input: {
      product: string;
      rate: number;
    }[];
  }[];
}) => (
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
              onClick={() => props.onChooseSavedSetting(record.timestamp)}
            >
              <PlayCircleOutlined />
            </Button>
            <Button
              onClick={() =>
                props.setSavedSettings(
                  props.savedSettings.filter(
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
    dataSource={props.resourceRatesPerFactory.map((factory) => ({
      key: factory.timestamp,
      ...factory,
    }))}
  />
);
