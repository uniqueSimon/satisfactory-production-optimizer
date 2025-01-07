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
}

export const NeededResources = (props: {
  productRates: Map<string, { rate: number; type?: "RESOURCE" | "MULTIPLE" }>;
  machines: Map<string, number>;
}) => {
  let sum = 0;
  props.machines.forEach((count, machineType) => {
    const space = MachineSpace[machineType as keyof typeof MachineSpace];
    sum += space * count;
  });
  sum /= MachineSpace.ConstructorMk1;
  return (
    <div style={{ display: "flex" }}>
      <Table
        style={{ border: "solid grey", borderRadius: 8 }}
        columns={[
          {
            dataIndex: "resource",
            title: "Input resource",
            render: (resource) => <IconWithTooltip item={resource} />,
          },
          {
            dataIndex: "rate",
            title: "Rate (1/min)",
            render: (rate) => <RoundedNumber number={rate} />,
          },
        ]}
        dataSource={[...props.productRates.entries()]
          .filter((x) => x[1].type === "RESOURCE")
          .map((x) => ({
            key: x[0],
            resource: x[0],
            rate: x[1].rate,
          }))}
        pagination={false}
      />
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
    </div>
  );
};
