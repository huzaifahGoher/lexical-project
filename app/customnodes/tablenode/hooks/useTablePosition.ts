import { useState, useEffect } from "react";
import { LexicalEditor } from "lexical";

interface UseTablePositionParams {
  editor: LexicalEditor;
  nodeKey: string;
  dimensionsWidth: number | null;
  dimensionsHeight: number | null;
}

interface OverlayPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function useTablePosition({
  editor,
  nodeKey,
  dimensionsWidth,
  dimensionsHeight,
}: UseTablePositionParams): OverlayPosition {
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Track the table element's position and size within the editor root.
  // Updates when dimensions change or when the DOM layout shifts.
  useEffect(() => {
    const tableElement = editor.getElementByKey(nodeKey);
    if (!tableElement) {
      return;
    }

    const updatePosition = () => {
      // Use getBoundingClientRect for viewport-relative fixed positioning
      const tableRect = tableElement.getBoundingClientRect();

      const pos = {
        top: tableRect.top,
        left: tableRect.left,
        width: tableRect.width,
        height: tableRect.height,
      };
      setOverlayPosition(pos);
    };

    updatePosition();

    // Use ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(tableElement);

    // Also update on scroll since we're using fixed positioning
    const handleScroll = () => updatePosition();
    window.addEventListener("scroll", handleScroll, true);

    // Also observe the parent for layout shifts
    const parentElement = tableElement.parentElement;
    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [editor, nodeKey, dimensionsWidth, dimensionsHeight]);

  return overlayPosition;
}
