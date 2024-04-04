import { Button } from "antd";
import { ContainerOverlay } from "./ContainerOverlay";

export const SavedSettingsButton = (props: {
  label: string;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  return (
    <ContainerOverlay icon="CLOSE" onClick={props.onDelete}>
      <Button onClick={props.onSelect}>{props.label}</Button>
    </ContainerOverlay>
  );
};
