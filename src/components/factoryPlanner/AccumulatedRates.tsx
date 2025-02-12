import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { Collapse, Tooltip } from "antd";
import { SavedFactory } from "./FactoryPlanner";
import { RateBalance } from "./accumulateRates";
import { maxRates } from "@/calculateProductWeights";

export const AccumulatedRates = (props: {
  cluster: SavedFactory[];
  rateBalance: RateBalance[];
  showResources: boolean;
  selectedFactory?: SavedFactory;
  hoveredFactory?: SavedFactory;
  setHoveredAccumulatedProduct: (product: string | null) => void;
}) => {
  const allResources = [...maxRates.keys()];
  const filtered = props.rateBalance.filter(
    (x) => props.showResources || !allResources.includes(x.product)
  );
  const relevantProducts = props.selectedFactory
    ? [
        props.selectedFactory.productToProduce,
        ...props.selectedFactory.input.map((x) => x.product),
      ]
    : [];
  const relevantProductsHovered = props.hoveredFactory
    ? [
        props.hoveredFactory.productToProduce,
        ...props.hoveredFactory.input.map((x) => x.product),
      ]
    : [];
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
                {filtered.map((productRate, i) => {
                  const isResource = allResources.includes(productRate.product);
                  const notEnough =
                    productRate.rate + productRate.rateFromOtherClusters < 0;
                  const relevantForClicked = relevantProducts.includes(
                    productRate.product
                  );
                  const relevantForHovered = relevantProductsHovered.includes(
                    productRate.product
                  );
                  return (
                    <div
                      key={productRate.product}
                      onMouseEnter={() =>
                        props.setHoveredAccumulatedProduct(productRate.product)
                      }
                      onMouseLeave={() =>
                        props.setHoveredAccumulatedProduct(null)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: 5,
                        color: isResource
                          ? "lightgrey"
                          : notEnough
                          ? "red"
                          : undefined,
                        borderStyle:
                          relevantForHovered && !relevantForClicked
                            ? "dotted"
                            : "solid",
                        borderColor:
                          relevantForClicked || relevantForHovered
                            ? "grey"
                            : "white",
                        borderRadius: 8,
                      }}
                    >
                      <Tooltip
                        title={
                          isResource || !notEnough
                            ? ""
                            : `${
                                productRate.rate < 0 ? "Produced" : "Needed"
                              }: ${Math.abs(
                                Math.round(
                                  productRate.rateFromOtherClusters * 100
                                ) / 100
                              )}/min`
                        }
                      >
                        {`${Math.round(productRate.rate * 100) / 100}/min`}
                      </Tooltip>
                      <IconWithTooltip item={productRate.product} />
                      {i < filtered.length - 1 ? "," : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};
