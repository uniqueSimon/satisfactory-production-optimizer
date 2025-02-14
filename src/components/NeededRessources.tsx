import { CustomCard } from "@/reusableComp/CustomCard";
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
    <CustomCard title="Needed space">
      <div style={{ display: "flex", alignItems: "center" }}>
        {[...props.machines.entries()].map(([machineType, count]) => (
          <div
            key={machineType}
            style={{
              display: "flex",
              alignItems: "center",
              border: "solid grey",
              borderRadius: 8,
            }}
          >
            {Math.round(count * 100) / 100}
            <IconWithTooltip item={machineType} />
          </div>
        ))}
      </div>
      Sum in units of constructors: {Math.round(sum * 100) / 100}
    </CustomCard>
  );
};
