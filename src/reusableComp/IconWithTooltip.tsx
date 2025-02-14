import { productDisplayNameMapping } from "@/App";
import { Tooltip } from "antd";

export const IconWithTooltip = (props: { item: string; height?: number }) => (
  <Tooltip title={productDisplayNameMapping.get(props.item)}>
    <img
      draggable={false}
      src={`items/desc-${props.item.toLowerCase().replace("_", "-")}-c_64.png`}
      style={{ height: props.height ?? 30, marginLeft: 5 }}
    />
  </Tooltip>
);
