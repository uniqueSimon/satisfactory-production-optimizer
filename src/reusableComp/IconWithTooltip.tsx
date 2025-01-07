import { productDisplayNameMapping } from "@/parseGameData/getProductDisplayNames";
import { Tooltip } from "antd";

export const IconWithTooltip = (props: { item: string }) => (
  <Tooltip title={productDisplayNameMapping.get(props.item)}>
    <img
      src={`items/desc-${props.item.toLowerCase().replace("_", "-")}-c_64.png`}
      style={{ height: 30, marginLeft: 5 }}
    />
  </Tooltip>
);
