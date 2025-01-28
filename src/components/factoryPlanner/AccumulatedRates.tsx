import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { FactoryDetails } from "./calculateFactoryDetails";
import { Collapse } from "antd";

export const AccumulatedRates = (props: {
  factoryDetails: FactoryDetails[];
}) => {
  const accumulatedRates = new Map<string, number>();
  const accumulate = (product: string, rate: number) => {
    const existing = accumulatedRates.get(product);
    accumulatedRates.set(product, (existing ?? 0) + rate);
  };
  for (const factory of props.factoryDetails) {
    accumulate(factory.output.product, factory.output.rate);
    for (const input of factory.input) {
      accumulate(input.product, -input.rate);
    }
  }
  const sortedRates = [...accumulatedRates.entries()].sort(
    (a, b) => a[1] - b[1]
  );
  return (
    <Collapse
      size="small"
      items={[
        {
          label: "Accumulated product rates",
          children: (
            <div style={{ border: "solid grey" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {sortedRates.map(([product, rate], i) => (
                  <div
                    key={product}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: 5,
                    }}
                  >
                    {`${Math.round(rate * 100) / 100}/min`}
                    <IconWithTooltip item={product} />
                    {i < sortedRates.length - 1 ? "," : ""}
                  </div>
                ))}
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};
