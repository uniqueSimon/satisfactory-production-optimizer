import { SavedFactory } from "./FactoryPlanner";
import { Button } from "antd";
import { CloseSquareOutlined } from "@ant-design/icons";
import { CustomCard } from "@/reusableComp/CustomCard";
import { AccumulatedRates } from "./AccumulatedRates";
import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Factory } from "./Factory";
import { RateBalance } from "./accumulateRates";

const useDropable = (
  cluster: SavedFactory[],
  onDropIntoCluster: (sourceId: number) => void
) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current!;
    const cleanupDropTarget = dropTargetForElements({
      element,
      canDrop: ({ source }) => !cluster.some((x) => x.id === source.data.id),
      onDrop: ({ source }) => onDropIntoCluster(source.data.id as number),
    });
    return () => {
      cleanupDropTarget();
    };
  }, [cluster]);
  return ref;
};

export const FactoryCluster = (props: {
  cluster: SavedFactory[];
  selectedFactoryId?: number;
  rateBalance: RateBalance[];
  showResources: boolean;
  hoveredFactoryId?: number | null;
  updateCluster: (cluster: SavedFactory[]) => void;
  onChooseFactory: (id: number) => void;
  setHoveredFactoryId: (id?: number | null) => void;
  onDropIntoCluster: (sourceId: number) => void;
  onRemoveCluster: () => void;
}) => {
  const [hoveredAccumulatedProduct, setHoveredAccumulatedProduct] = useState<
    string | null
  >(null);
  const refDropable = useDropable(props.cluster, props.onDropIntoCluster);
  const selectedFactory = props.cluster.find(
    (x) => x.id === props.selectedFactoryId
  );
  const hoveredFactory = props.cluster.find(
    (x) => x.id === props.hoveredFactoryId
  );
  const onMoveCard = (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => {
    const sourceIndex = props.cluster.findIndex((x) => x.id === sourceId);
    const targetIndex = props.cluster.findIndex((x) => x.id === targetId);
    if (sourceIndex === -1) {
      //comes from another factory cluster
      return;
    }
    const insertionIndex =
      closestEdge === "left" ? targetIndex : targetIndex + 1;
    const firstPart = props.cluster
      .slice(0, insertionIndex)
      .filter((x) => x.id !== sourceId);
    const lastPart = props.cluster
      .slice(insertionIndex)
      .filter((x) => x.id !== sourceId);
    props.updateCluster([
      ...firstPart,
      props.cluster[sourceIndex],
      ...lastPart,
    ]);
  };
  return (
    <CustomCard>
      <div
        ref={refDropable}
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {props.cluster.map((factory) => (
            <Factory
              key={factory.id}
              factory={factory}
              hoveredAccumulatedProduct={hoveredAccumulatedProduct}
              selected={props.selectedFactoryId === factory.id}
              onSelect={() => props.onChooseFactory(factory.id)}
              setHoveredFactoryId={props.setHoveredFactoryId}
              onDrop={onMoveCard}
            />
          ))}
          <div style={{ border: "solid", borderColor: "white" }}>
            <Button
              onClick={() => {
                const now = Date.now();
                props.updateCluster([
                  ...props.cluster,
                  {
                    id: now,
                    productToProduce: "",
                    wantedOutputRate: 0,
                    selectedRecipes: [],
                    dedicatedProducts: [],
                    input: [],
                  },
                ]);
                props.onChooseFactory(now);
              }}
            >
              + new
            </Button>
          </div>
        </div>
        <Button onClick={props.onRemoveCluster}>
          <CloseSquareOutlined />
        </Button>
      </div>
      <AccumulatedRates
        showResources={props.showResources}
        rateBalance={props.rateBalance}
        cluster={props.cluster}
        selectedFactory={selectedFactory}
        hoveredFactory={hoveredFactory}
        setHoveredAccumulatedProduct={setHoveredAccumulatedProduct}
      />
    </CustomCard>
  );
};
