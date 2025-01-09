import { CustomCard } from "@/reusableComp/CustomCard";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";

export const DetailedView = (props: {
  onDelete: () => void;
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
}) => {
  if (!props.resourceRates) {
    return;
  }
  return (
    <CustomCard>
      <Button onClick={() => props.onDelete()}>
        <DeleteOutlined />
      </Button>
      <div style={{ display: "flex" }}>
        {props.resourceRates.input.map((x) => (
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
      <div
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
        {Math.round(props.resourceRates.output.rate * 100) / 100}
        {"/min"}
        <IconWithTooltip item={props.resourceRates.output.product} />
      </div>
    </CustomCard>
  );
};
