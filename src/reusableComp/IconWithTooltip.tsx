import { productDisplayNameMapping } from "@/App";
import { Tooltip } from "antd";

export const IconWithTooltip = (props: { item: string; height?: number }) => (
  <div className="relative group">
    <button
      type="button"
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      {props.item}
    </button>

    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-lg">
      Tooltip content
    </div>
  </div>
);

export const IconWithTooltipOld2 = (props: {
  item: string;
  height?: number;
}) => (
  <>
    <div
      data-tooltip-target="tooltip-light"
      data-tooltip-style="light"
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      <img
        draggable={false}
        src={`items/desc-${props.item
          .toLowerCase()
          .replace("_", "-")}-c_64.png`}
        style={{ height: props.height ?? 30, marginLeft: 5 }}
      />
    </div>
    <div
      id="tooltip-light"
      role="tooltip"
      className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 tooltip"
    >
      {productDisplayNameMapping.get(props.item)}
      <div className="tooltip-arrow" data-popper-arrow></div>
    </div>
  </>
);

export const IconWithTooltipOld = (props: {
  item: string;
  height?: number;
}) => (
  <Tooltip title={productDisplayNameMapping.get(props.item)}>
    <img
      draggable={false}
      src={`items/desc-${props.item.toLowerCase().replace("_", "-")}-c_64.png`}
      style={{ height: props.height ?? 30, marginLeft: 5 }}
    />
  </Tooltip>
);
