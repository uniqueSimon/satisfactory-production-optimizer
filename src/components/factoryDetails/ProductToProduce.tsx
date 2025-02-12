import { allProducts, productDisplayNameMapping } from "@/App";
import { Form, Select } from "antd";

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
          label: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                draggable={false}
                src={`items/desc-${x.toLowerCase().replace("_", "-")}-c_64.png`}
                style={{ height: 20, marginRight: 5 }}
              />
              {productDisplayNameMapping.get(x)!}
            </div>
          ),
        }))}
        value={props.productToProduce}
        onChange={props.setProductToProduce}
        filterOption={(input, option) =>
          productDisplayNameMapping
            .get(option!.value)!
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
};
