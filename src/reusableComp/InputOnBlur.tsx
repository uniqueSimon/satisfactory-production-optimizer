import { InputNumber } from "antd";
import { useEffect, useState } from "react";

export const InputOnBlur = (props: {
  commitedValue: number;
  setCommitedValue: (value: number) => void;
}) => {
  const [inputValue, setInputValue] = useState<number | null>();
  useEffect(() => setInputValue(props.commitedValue), [props.commitedValue]);
  return (
    <InputNumber
      value={inputValue}
      onChange={(x) => setInputValue(x)}
      onBlur={(e) =>
        props.setCommitedValue(isNaN(+e.target.value) ? 0 : +e.target.value)
      }
      style={{ width: 100, marginRight: 8 }}
    />
  );
};
