import { useEffect, useRef } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  extractClosestEdge,
  attachClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

export const useDraggable = (
  id: number,
  onDrop: (sourceId: number, targetId: number, edge: "left" | "right") => void
) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current!;
    const cleanupDraggable = draggable({
      element,
      getInitialData: () => ({ id }),
    });
    const cleanupDropTarget = dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.id !== id,
      getData: ({ input, element }) => {
        const attached = attachClosestEdge(
          {},
          {
            input,
            element,
            allowedEdges: ["left", "right"],
          }
        );
        return attached;
      },
      onDrop: ({ source, self }) => {
        const edge = extractClosestEdge(self.data) as "left" | "right";
        onDrop(source.data.id as number, id, edge);
      },
    });
    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [id, onDrop]);
  return ref;
};
