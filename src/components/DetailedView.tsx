import { CustomCard } from "@/reusableComp/CustomCard";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { CloseSquareOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";

export const DetailedView = (props: {
  onDelete: () => void;
  onClose: () => void;
  resourceRates: {
    timestamp: number;
    output: {
      product: string;
      rate: number;
    };
    input: {
      product: string;
      rate: number;
    }[];
  };
  targetFactories: { timestamp: number; neededRate: number; product: string }[];
}) => {
  if (!props.resourceRates) {
    return;
  }
  return (
    <CustomCard>
      <Button onClick={() => props.onDelete()}>
        <DeleteOutlined />
      </Button>
      <Button onClick={() => props.onClose()}>
        <CloseSquareOutlined />
      </Button>
      <div style={{ display: "flex" }}>
        <div>
          {props.resourceRates.input.map((x) => (
            <div key={x.product} style={{ display: "flex", margin: 10 }}>
              <IconWithTooltip item={x.product} />
              <RateWithArrow rate={x.rate} />
            </div>
          ))}
        </div>
        <IconWithRate {...props.resourceRates.output} />
        <div>
          {props.targetFactories.map((x) => (
            <div key={x.timestamp} style={{ display: "flex", margin: 10 }}>
              <RateWithArrow rate={x.neededRate} />
              <IconWithTooltip item={x.product} />
            </div>
          ))}
        </div>
      </div>
    </CustomCard>
  );
};

const IconWithRate = (props: { rate: number; product: string }) => (
  <div
    key={props.product}
    style={{
      border: "solid grey",
      borderWidth: 0.5,
      borderRadius: 8,
      padding: "10px 40px",
      margin: 3,
    }}
  >
    <div>{`${Math.round(props.rate * 100) / 100}/min`}</div>
    <IconWithTooltip item={props.product} height={60} />
  </div>
);
const RateWithArrow = (props: { rate: number }) => (
  <div>
    <div style={{ marginBottom: -10 }}>{`${
      Math.round(props.rate * 100) / 100
    }/min`}</div>
    <div>{"---------->"}</div>
  </div>
);
