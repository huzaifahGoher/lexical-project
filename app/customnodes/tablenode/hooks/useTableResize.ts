import { useCallback, MutableRefObject } from "react";
import { $getNodeByKey, LexicalEditor } from "lexical";
import { CustomTableNode } from "../tableNode";
import { MIN_WIDTH, MIN_HEIGHT } from "../constants/tableDecoratorConstants";
import { HoverState, CellHoverState } from "../types/tableDecoratorTypes";

interface UseTableResizeParams {
  editor: LexicalEditor;
  nodeKey: string;
  dimensions: { width: number | null; height: number | null };
  currentDimensions: MutableRefObject<{ width: number; height: number }>;
  setDimensions: React.Dispatch<
    React.SetStateAction<{ width: number | null; height: number | null }>
  >;
  setColumnHoverState: React.Dispatch<React.SetStateAction<HoverState>>;
  setRowHoverState: React.Dispatch<React.SetStateAction<HoverState>>;
  setCellHoverState: React.Dispatch<React.SetStateAction<CellHoverState>>;
  isResizingRef: MutableRefObject<boolean>;
}

export function useTableResize({
  editor,
  nodeKey,
  dimensions,
  currentDimensions,
  setDimensions,
  setColumnHoverState,
  setRowHoverState,
  setCellHoverState,
  isResizingRef,
}: UseTableResizeParams): (event: React.MouseEvent<HTMLDivElement>) => void {
  // Resize handle: mousedown/mousemove/mouseup drag logic
  const handleResizeMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // Determine starting dimensions: use current dimensions or fall back
      // to the table's computed DOM dimensions if width/height is null.
      let startWidth = dimensions.width;
      let startHeight = dimensions.height;

      if (startWidth === null || startHeight === null) {
        const tableElement = editor.getElementByKey(nodeKey);
        if (tableElement) {
          const rect = tableElement.getBoundingClientRect();
          if (startWidth === null) startWidth = rect.width;
          if (startHeight === null) startHeight = rect.height;
        } else {
          // Fallback to minimums if DOM element not found
          if (startWidth === null) startWidth = MIN_WIDTH;
          if (startHeight === null) startHeight = MIN_HEIGHT;
        }
      }

      const startX = event.clientX;
      const startY = event.clientY;
      const initialWidth = startWidth;
      const initialHeight = startHeight;

      isResizingRef.current = true;
      // Hide any visible hover buttons during resize
      setColumnHoverState((prev) => ({ ...prev, visible: false }));
      setRowHoverState((prev) => ({ ...prev, visible: false }));
      setCellHoverState((prev) => ({ ...prev, visible: false }));

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        // Calculate desired dimensions
        let newWidth = Math.max(MIN_WIDTH, initialWidth + deltaX);
        let newHeight = Math.max(MIN_HEIGHT, initialHeight + deltaY);

        // Apply dimensions to the table element to check actual rendered size
        const tableElement = editor.getElementByKey(nodeKey);
        if (tableElement) {
          tableElement.style.setProperty("width", `${newWidth}px`, "important");
          tableElement.style.setProperty("height", `${newHeight}px`, "important");

          // The table may not shrink below its content minimum.
          // Use the actual rendered size as the effective minimum.
          const actualWidth = tableElement.getBoundingClientRect().width;
          const actualHeight = tableElement.getBoundingClientRect().height;

          // Clamp to what the table actually rendered at
          newWidth = Math.max(newWidth, actualWidth);
          newHeight = Math.max(newHeight, actualHeight);
        }

        setDimensions({ width: newWidth, height: newHeight });
        currentDimensions.current = { width: newWidth, height: newHeight };
      };

      const handleMouseUp = () => {
        isResizingRef.current = false;

        // Persist final dimensions to the CustomTableNode
        editor.update(() => {
          const node = $getNodeByKey(nodeKey) as CustomTableNode | null;
          if (node) {
            node.setWidth(currentDimensions.current.width);
            node.setHeight(currentDimensions.current.height);
          }
        });

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [editor, nodeKey, dimensions, currentDimensions, setDimensions, setColumnHoverState, setRowHoverState, setCellHoverState, isResizingRef]
  );

  return handleResizeMouseDown;
}
