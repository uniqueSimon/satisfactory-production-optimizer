import { Recipe } from "@/App";
import { InputOnBlur } from "@/reusableComp/InputOnBlur";
import { Form } from "antd";

export const OutputRate = (props: {
  rootRecipe?: Recipe;
  wantedOutputRate: number;
  setWantedOutputRate: (rate: number) => void;
}) => {
  const numberOfRootMachines = props.rootRecipe
    ? props.wantedOutputRate /
      ((props.rootRecipe.product.amount / props.rootRecipe.time) * 60)
    : 0;
  const setNumberOfMachines = (number: number) => {
    const rate = props.rootRecipe
      ? number *
        ((props.rootRecipe.product.amount / props.rootRecipe.time) * 60)
      : 0;
    props.setWantedOutputRate(rate);
  };
  return (
    <>
      <Form.Item label="Output rate (1/min)">
        <InputOnBlur
          commitedValue={props.wantedOutputRate}
          setCommitedValue={(value) => props.setWantedOutputRate(value)}
        />
      </Form.Item>
      <Form.Item label="Number of final machines">
        <InputOnBlur
          commitedValue={Math.round(numberOfRootMachines * 100) / 100}
          setCommitedValue={(x) => setNumberOfMachines(x ?? 0)}
        />
      </Form.Item>
    </>
  );
};
