import { Form, Select } from "antd";
import { productDisplayNameMapping } from "../parseGameData/getProductDisplayNames";
import { allProducts } from "../parseGameData/allRecipesFromConfig";

export const ProductToProduce = (props: {
  productToProduce: string;
  setProductToProduce: (productToProduce: string) => void;
}) => {
  return (
    <Form.Item
      label="Product"
      tooltip={{ title: "Select a product to produce" }}
      style={{ marginRight: 8, width: 400 }}
    >
      <Select
        showSearch={true}
        options={allProducts.map((x) => ({
          key: x,
          value: x,
          label: productDisplayNameMapping.get(x)!,
        }))}
        value={props.productToProduce}
        onChange={props.setProductToProduce}
        filterOption={(input, option) =>
          option!.label.toLowerCase().includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
};
