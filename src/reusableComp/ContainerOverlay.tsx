import React from "react";
import { useState } from "react";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";

const style = { fontSize: "18px", color: "white", padding: "5px" };
export const ContainerOverlay = (props: {
  children: React.ReactNode;
  icon: "CLOSE" | "ADD";
  onClick: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {props.children}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
          onClick={props.onClick}
        >
          {props.icon === "ADD" ? (
            <PlusOutlined style={style} />
          ) : props.icon === "CLOSE" ? (
            <CloseOutlined style={style} />
          ) : null}
        </div>
      )}
    </div>
  );
};
