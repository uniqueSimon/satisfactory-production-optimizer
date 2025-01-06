import { Form, Select } from "antd";
import { productDisplayNameMapping } from "../parseGameData/getProductDisplayNames";

export const DedicatedProducts = (props: {
  currentProducts: string[];
  dedicatedProducts: string[];
  setDedicatedProducts: (dedicatedProducts: string[]) => void;
}) => {
  return (
    <Form.Item
      label="Dedicated products"
      tooltip={{ title: "Select products for a dedicated production" }}
    >
      <Select
        mode="multiple"
        allowClear={true}
        options={props.currentProducts.map((x) => ({
          key: x,
          value: x,
          label: productDisplayNameMapping.get(x)!,
        }))}
        value={props.dedicatedProducts}
        onChange={props.setDedicatedProducts}
      />
    </Form.Item>
  );
};
