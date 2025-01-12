import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { FactoryDetails } from "./calculateFactoryDetails";

export const DetailedView = (props: { factoryDetails: FactoryDetails }) => {
  const neededOutputRate = props.factoryDetails.targetFactories.reduce(
    (sum, current) => sum + current.rate,
    0
  );
  return (
    <div style={{ display: "flex" }}>
      <div>
        {props.factoryDetails.input.map((x) => {
          const source = props.factoryDetails.sourceFactories.find(
            (source) => source.product === x.product
          );
          return (
            <div key={x.product} style={{ display: "flex", margin: 10 }}>
              <IconWithTooltip item={x.product} />
              <RateWithArrow rate={x.rate} availableRate={source?.rate} />
            </div>
          );
        })}
      </div>
      <IconWithRate
        {...props.factoryDetails.output}
        insufficientOutput={props.factoryDetails.output.rate < neededOutputRate}
      />
      <div>
        {props.factoryDetails.targetFactories.map((x) => (
          <div key={x.timestamp} style={{ display: "flex", margin: 10 }}>
            <RateWithArrow rate={x.rate} />
            <IconWithTooltip item={x.product} />
          </div>
        ))}
      </div>
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
