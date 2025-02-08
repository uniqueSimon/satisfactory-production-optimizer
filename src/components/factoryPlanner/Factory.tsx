import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { useDraggable } from "@/reusableComp/useDraggable";
import { Button } from "antd";
import { SavedFactory } from "./FactoryPlanner";

export const Factory = (props: {
  factory: SavedFactory;
  selected: boolean;
  hoveredAccumulatedProduct: string | null;
  onSelect: () => void;
  setHoveredFactoryId: (id: number | null) => void;
  onDrop: (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => void;
}) => {
  const ref = useDraggable(props.factory.id, props.onDrop);
  const hoveredIsOutput =
    props.factory.productToProduce === props.hoveredAccumulatedProduct;
  const hoveredIsInput = props.factory.input.some(
    (x) => x.product === props.hoveredAccumulatedProduct
  );
  return (
    <div
      ref={ref}
      style={{
        borderStyle: hoveredIsOutput
          ? "dashed"
          : hoveredIsInput
          ? "dotted"
          : "solid",
        borderColor:
          props.selected || hoveredIsOutput || hoveredIsInput
            ? undefined
            : "white",
      }}
    >
      <Button
        onMouseEnter={() => props.setHoveredFactoryId(props.factory.id)}
        onMouseLeave={() => props.setHoveredFactoryId(null)}
        onClick={props.onSelect}
        style={{
          display: "flex",
          alignItems: "center",
          borderColor: props.selected ? "blue" : undefined,
        }}
      >
        {Math.round(props.factory.wantedOutputRate * 100) / 100}/min
        <IconWithTooltip item={props.factory.productToProduce} />
      </Button>
    </div>
  );
};
