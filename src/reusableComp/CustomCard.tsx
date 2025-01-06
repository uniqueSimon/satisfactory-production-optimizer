import { Card } from "antd";

export const CustomCard = (props: {
  title?: string;
  children: React.ReactNode;
}) => (
  <Card
    size="small"
    style={{ border: "solid grey", borderRadius: 8 }}
    title={props.title}
  >
    {props.children}
  </Card>
);
