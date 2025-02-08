import { Button, Form, Switch } from "antd";
import { CustomCard } from "@/reusableComp/CustomCard";
import { useState } from "react";
import { FactoryCluster } from "./FactoryCluster";
import { DetailedView } from "./DetailedView";
import {
  CloseSquareOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { calculateFactoryDetails } from "./calculateFactoryDetails";
import { accumulateRates } from "./accumulateRates";

export interface SavedFactory {
  id: number;
  productToProduce: string;
  wantedOutputRate: number;
  selectedRecipes: string[];
  dedicatedProducts: string[];
  input: { product: string; rate: number }[];
}

export const FactoryPlanner = (props: {
  savedFactories: SavedFactory[][];
  setSavedFactories: (newValue: React.SetStateAction<SavedFactory[][]>) => void;
  clickedFactoryId: number | undefined;
  setClickedFactoryId: React.Dispatch<React.SetStateAction<number | undefined>>;
}) => {
  const [hoveredFactoryId, setHoveredFactoryId] = useState<number | null>();
  const [showResources, setShowResources] = useState(false);
  const combinedSavedFactories = props.savedFactories.flat();
  const selectedSavedSettings = combinedSavedFactories.find(
    (x) => x.id === props.clickedFactoryId
  );
  const rateBalance = accumulateRates(props.savedFactories);
  return (
    <CustomCard title="Factory planner">
      <Button
        onClick={() =>
          props.setSavedFactories((prev) => [
            ...prev.map((cluster) => calculateFactoryDetails(cluster)),
          ])
        }
      >
        Recalculate saved factories
      </Button>
      <Form.Item label="Show resources" style={{ margin: 0 }}>
        <Switch checked={showResources} onChange={setShowResources} />
      </Form.Item>
      {props.savedFactories.map((cluster, index) => (
        <FactoryCluster
          key={index}
          cluster={cluster}
          hoveredFactoryId={hoveredFactoryId}
          showResources={showResources}
          updateCluster={(cluster) =>
            props.setSavedFactories((prev) =>
              prev.map((prevCluster, i) =>
                i === index ? cluster : prevCluster
              )
            )
          }
          rateBalance={rateBalance[index]}
          setHoveredFactoryId={setHoveredFactoryId}
          selectedFactoryId={props.clickedFactoryId}
          onChooseFactory={props.setClickedFactoryId}
          onDropIntoCluster={(sourceId) => {
            props.setSavedFactories((prev) => {
              const sourceFactory = prev.flat().find((x) => x.id === sourceId)!;
              const withoutSource = prev.map((cluster) =>
                cluster.filter((x) => x.id !== sourceId)
              );
              withoutSource[index].push(sourceFactory);
              return [...withoutSource];
            });
          }}
          onRemoveCluster={() =>
            props.setSavedFactories((prev) => [
              ...prev.filter((_, i) => i !== index),
            ])
          }
        />
      ))}
      <Button onClick={() => props.setSavedFactories((prev) => [...prev, []])}>
        <PlusSquareOutlined />
        Add factory cluster
      </Button>
      <div style={{ display: "flex" }}>
        {selectedSavedSettings && (
          <>
            <CustomCard>
              <Button
                onClick={() => {
                  props.setClickedFactoryId(undefined);
                  props.setSavedFactories(
                    props.savedFactories.map((part) =>
                      part.filter((x) => x.id !== props.clickedFactoryId)
                    )
                  );
                }}
              >
                <DeleteOutlined />
              </Button>
              <Button onClick={() => props.setClickedFactoryId(undefined)}>
                <CloseSquareOutlined />
              </Button>
              <Button
                onClick={() => {
                  const timestamp = Date.now();
                  const clusterIndex = props.savedFactories.findIndex((x) =>
                    x.some((y) => y.id === props.clickedFactoryId)
                  );
                  const source = props.savedFactories[clusterIndex].find(
                    (x) => x.id === props.clickedFactoryId
                  )!;
                  props.savedFactories[clusterIndex].push({
                    ...source,
                    id: timestamp,
                  });
                  props.setClickedFactoryId(timestamp);
                }}
              >
                <CopyOutlined />
              </Button>
              <DetailedView savedSetting={selectedSavedSettings} />
            </CustomCard>
          </>
        )}
        {hoveredFactoryId && hoveredFactoryId !== props.clickedFactoryId && (
          <CustomCard>
            <DetailedView
              savedSetting={
                combinedSavedFactories.find((x) => x.id === hoveredFactoryId)!
              }
            />
          </CustomCard>
        )}
      </div>
    </CustomCard>
  );
};

{
  /* <NeededResources machines={selectedFactory.machines} /> */
}
