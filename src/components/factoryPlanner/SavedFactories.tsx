import { SavedSetting } from "./FactoryPlanner";
import { Button, Tooltip } from "antd";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { useDraggable } from "@/reusableComp/useDraggable";
import { FactoryDetails } from "./calculateFactoryDetails";
import {
  CaretUpOutlined,
  CloseSquareOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { CustomCard } from "@/reusableComp/CustomCard";
import { AccumulatedRates } from "./AccumulatedRates";
import { useEffect, useRef } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

export const SavedFactories = (props: {
  factoryDetails: FactoryDetails[];
  cluster: SavedSetting[];
  selectedFactoryId?: number;
  setSavedSettings: (value: SavedSetting[]) => void;
  onChooseSavedSetting: (timestamp: number) => void;
  onMouseEnter: (timestamp: number) => void;
  onMouseLeave: () => void;
  onAddNew: () => void;
  onInsertCard: (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => void;
  onDropIntoCluster: (sourceId: number) => void;
  onRemoveCluster: () => void;
}) => {
  const refDropable = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = refDropable.current!;
    const cleanupDropTarget = dropTargetForElements({
      element,
      canDrop: ({ source }) =>
        !props.cluster.some((x) => x.timestamp === source.data.id),
      onDrop: ({ source }) => props.onDropIntoCluster(source.data.id as number),
    });
    return () => {
      cleanupDropTarget();
    };
  }, [props.cluster]);
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
          {props.factoryDetails.map((details) => {
            const neededOutputRate = details.targetFactories.reduce(
              (sum, current) => sum + current.rate,
              0
            );
            return (
              <SavedSettingsButton
                key={details.timestamp}
                timestamp={details.timestamp}
                product={details.output.product}
                rate={details.output.rate}
                selected={props.selectedFactoryId === details.timestamp}
                insufficientOutput={details.output.rate < neededOutputRate}
                insufficientInputs={details.sourceFactories.some(
                  (x) =>
                    x.rate <
                    details.input.find((y) => y.product === x.product)!.rate
                )}
                isTargetFactory={details.sourceFactories.some(
                  (x) => x.timestamp === props.selectedFactoryId
                )}
                isSourceFactory={details.targetFactories.some(
                  (x) => x.timestamp === props.selectedFactoryId
                )}
                onSelect={() => props.onChooseSavedSetting(details.timestamp)}
                onMouseEnter={() => props.onMouseEnter(details.timestamp)}
                onMouseLeave={() => props.onMouseLeave()}
                onDrop={props.onInsertCard}
              />
            );
          })}
          <div style={{ border: "solid", borderColor: "white" }}>
            <Button onClick={props.onAddNew}>+ new</Button>
          </div>
        </div>
        <Button onClick={props.onRemoveCluster} style={{}}>
          <CloseSquareOutlined />
        </Button>
      </div>
      <AccumulatedRates factoryDetails={props.factoryDetails} />
    </CustomCard>
  );
};

const SavedSettingsButton = (props: {
  timestamp: number;
  product: string;
  rate: number;
  insufficientOutput: boolean;
  insufficientInputs: boolean;
  selected: boolean;
  isTargetFactory: boolean;
  isSourceFactory: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDrop: (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => void;
}) => {
  const ref = useDraggable(props.timestamp, props.onDrop);
  return (
    <div
      ref={ref}
      style={{
        borderStyle: props.isTargetFactory
          ? "dashed"
          : props.isSourceFactory
          ? "dotted"
          : "solid",
        borderColor:
          props.selected || props.isTargetFactory || props.isSourceFactory
            ? undefined
            : "white",
      }}
    >
      <Button
        onMouseEnter={() => props.onMouseEnter()}
        onMouseLeave={() => props.onMouseLeave()}
        onClick={props.onSelect}
        style={{
          display: "flex",
          alignItems: "center",
          borderColor:
            props.insufficientInputs || props.insufficientOutput
              ? "red"
              : props.selected
              ? "blue"
              : undefined,
        }}
      >
        {props.insufficientOutput && (
          <Tooltip title="More needed!">
            <CaretUpOutlined />
          </Tooltip>
        )}
        {props.insufficientInputs && (
          <Tooltip title="Insufficient Inputs">
            <ExclamationCircleOutlined />
          </Tooltip>
        )}
        {Math.round(props.rate * 100) / 100}/min
        <IconWithTooltip item={props.product} />
      </Button>
    </div>
  );
};
