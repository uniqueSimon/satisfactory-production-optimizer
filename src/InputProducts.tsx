import { Checkbox, Form } from "antd";
import { productDisplayNameMapping } from "./getProductDisplayNames";

export const InputProducts = (props: {
  inputProducts: string[];
  allRelevantProducts: string[];
  setInputProducts: (inputProducts: string[]) => void;
}) => {
  return (
    <Form.Item label="Input products">
      <Checkbox
        style={{ marginRight: 8 }}
        onChange={(e) =>
          props.setInputProducts(
            e.target.checked ? props.allRelevantProducts : []
          )
        }
        checked={
          props.inputProducts.length === props.allRelevantProducts.length
        }
        indeterminate={
          props.inputProducts.length !== props.allRelevantProducts.length &&
          props.inputProducts.length > 0
        }
      >
        Select all
      </Checkbox>
      <Checkbox.Group
        options={props.allRelevantProducts.map((x) => ({
          key: x,
          value: x,
          label: productDisplayNameMapping.get(x),
        }))}
        value={props.inputProducts}
        onChange={(products) => props.setInputProducts(products)}
      />
    </Form.Item>
  );
};
