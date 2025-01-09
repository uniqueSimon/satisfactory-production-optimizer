import { ContainerOverlay } from "@/reusableComp/ContainerOverlay";
import { SavedSetting } from "./SavedSettings";
import { Button, Tooltip } from "antd";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";
import { useDraggable } from "@/reusableComp/useDraggable";

export const SavedFactories = (props: {
  savedSettings: SavedSetting[];
  accumulatedRates: Map<string, number>;
  setSavedSettings: (value: SavedSetting[]) => void;
  onChooseSavedSetting: (timestamp: number) => void;
  onMouseEnter: (timestamp: number) => void;
  onMouseLeave: () => void;
}) => {
  const insertCard = (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => {
    const sourceItem = props.savedSettings.find(
      (x) => x.timestamp === sourceId
    )!;
    const targetIndex = props.savedSettings.findIndex(
      (x) => x.timestamp === targetId
    );
    const insertionIndex =
      closestEdge === "left" ? targetIndex : targetIndex + 1;
    const firstPart = props.savedSettings
      .slice(0, insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    const lastPart = props.savedSettings
      .slice(insertionIndex)
      .filter((x) => x.timestamp !== sourceId);
    props.setSavedSettings([...firstPart, sourceItem, ...lastPart]);
  };
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        marginBottom: 10,
      }}
    >
      {props.savedSettings.map((setting) => (
        <SavedSettingsButton
          key={setting.timestamp}
          setting={setting}
          accumulatedRates={props.accumulatedRates}
          onSelect={() => props.onChooseSavedSetting(setting.timestamp)}
          onMouseEnter={() => props.onMouseEnter(setting.timestamp)}
          onMouseLeave={() => props.onMouseLeave()}
          onDelete={() => {
            props.setSavedSettings(
              props.savedSettings.filter(
                (x) => x.timestamp !== setting.timestamp
              )
            );
          }}
          onDrop={insertCard}
        />
      ))}
    </div>
  );
};

const SavedSettingsButton = (props: {
  setting: SavedSetting;
  accumulatedRates: Map<string, number>;
  onSelect: () => void;
  onDelete: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDrop: (
    sourceId: number,
    targetId: number,
    closestEdge: "left" | "right"
  ) => void;
}) => {
  const ref = useDraggable(props.setting.timestamp, props.onDrop);
  const accumulatedRate = props.accumulatedRates.get(
    props.setting.productToProduce
  )!;
  return (
    <Button
      onMouseEnter={() => props.onMouseEnter()}
      onMouseLeave={() => props.onMouseLeave()}
      ref={ref}
      onClick={props.onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        margin: 1,
        borderColor: accumulatedRate < 0 ? "red" : undefined,
      }}
    >
      <Tooltip title={`${Math.round(accumulatedRate * 100) / 100}/min`}>
        {props.setting.wantedOutputRate}/min
      </Tooltip>
      <IconWithTooltip item={props.setting.productToProduce} />
    </Button>
  );
};

{
  /* <ContainerOverlay icon="CLOSE" onClick={props.onDelete}> */
}
/*  </ContainerOverlay> */
