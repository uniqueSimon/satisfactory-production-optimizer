import { Table } from "antd";
import { RoundedNumber } from "../reusableComp/RoundedNumber";
import { IconWithTooltip } from "@/reusableComp/IconWithTooltip";

enum MachineSpace {
  ManufacturerMk1 = 360,
  ConstructorMk1 = 80,
  AssemblerMk1 = 150,
  Blender = 288,
  FoundryMk1 = 90,
  OilRefinery = 200,
  Packager = 64,
  SmelterMk1 = 54,
  HadronCollider = 912,
  Converter = 256,
}

export const NeededResources = (props: { machines: Map<string, number> }) => {
  let sum = 0;
  props.machines.forEach((count, machineType) => {
    const space = MachineSpace[machineType as keyof typeof MachineSpace];
    sum += space * count;
  });
  sum /= MachineSpace.ConstructorMk1;
  return (
    <Table
      style={{ border: "solid grey", borderRadius: 8 }}
      columns={[
        {
          dataIndex: "machineType",
          title: "Machine type",
          render: (producedIn) =>
            producedIn === "Weighted sum" ? (
              "Weighted sum"
            ) : (
              <IconWithTooltip item={producedIn} />
            ),
        },
        {
          dataIndex: "count",
          title: "Count",
          render: (rate) => <RoundedNumber number={rate} />,
        },
      ]}
      dataSource={[...props.machines.entries(), ["Weighted sum", sum]].map(
        (x) => ({
          key: x[0],
          machineType: x[0],
          count: x[1],
        })
      )}
      pagination={false}
    />
  );
};
