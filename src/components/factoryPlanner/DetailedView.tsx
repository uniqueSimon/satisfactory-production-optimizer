import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { SavedFactory } from "./FactoryPlanner";

export const DetailedView = (props: { savedSetting: SavedFactory }) => {
  return (
    <div style={{ display: "flex" }}>
      <div>
        {props.savedSetting.input.map((x) => {
          return (
            <div key={x.product} style={{ display: "flex", margin: 10 }}>
              <IconWithTooltip item={x.product} />
              <RateWithArrow rate={x.rate} />
            </div>
          );
        })}
      </div>
      <IconWithRate
        rate={props.savedSetting.wantedOutputRate}
        product={props.savedSetting.productToProduce}
        insufficientOutput={false}
      />
    </div>
  );
};

const IconWithRate = (props: {
  rate: number;
  product: string;
  insufficientOutput: boolean;
}) => (
  <div
    key={props.product}
    style={{
      color: props.insufficientOutput ? "red" : undefined,
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
const RateWithArrow = (props: { rate: number; availableRate?: number }) => (
  <div>
    <div style={{ marginBottom: -10 }}>
      {`${Math.round(props.rate * 100) / 100}/min`}
      {props.availableRate && (
        <span
          style={{
            color: props.availableRate < props.rate ? "red" : undefined,
          }}
        >{` (${Math.round(props.availableRate * 100) / 100}/min)`}</span>
      )}
    </div>
    <div>{"---------->"}</div>
  </div>
);
