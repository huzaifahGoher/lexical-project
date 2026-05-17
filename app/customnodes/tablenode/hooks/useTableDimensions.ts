import { useState, useEffect, useRef, MutableRefObject } from "react";
import { LexicalEditor } from "lexical";

interface UseTableDimensionsParams {
  editor: LexicalEditor;
  nodeKey: string;
  width: number | null;
  height: number | null;
}

interface UseTableDimensionsReturn {
  dimensions: { width: number | null; height: number | null };
  setDimensions: React.Dispatch<
    React.SetStateAction<{ width: number | null; height: number | null }>
  >;
  currentDimensions: MutableRefObject<{ width: number; height: number }>;
}

export function useTableDimensions({
  editor,
  nodeKey,
  width,
  height,
}: UseTableDimensionsParams): UseTableDimensionsReturn {
  const [dimensions, setDimensions] = useState<{
    width: number | null;
    height: number | null;
  }>({ width, height });

  const currentDimensions = useRef<{ width: number; height: number }>({
    width: width ?? 0,
    height: height ?? 0,
  });

  // Sync dimensions from props when they change externally.
  // This effect synchronizes external prop changes (e.g., from undo/redo or
  // collaborative edits) into local state used for live resize preview.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDimensions({ width, height });
    currentDimensions.current = {
      width: width ?? 0,
      height: height ?? 0,
    };
  }, [width, height]);

  // Apply table dimensions from node state to the actual table DOM element.
  // When width/height are null, the table uses its natural auto dimensions.
  // This ensures the table visually reflects the persisted dimensions.
  // Also uses a MutationObserver to re-apply after Lexical DOM reconciliation.
  useEffect(() => {
    const tableElement = editor.getElementByKey(nodeKey);
    if (!tableElement) return;

    const applyDimensions = () => {
      // Use currentDimensions ref for the latest values (avoids stale closures)
      const w = currentDimensions.current.width;
      const h = currentDimensions.current.height;

      if (w > 0) {
        tableElement.style.setProperty("width", `${w}px`, "important");
      } else {
        tableElement.style.removeProperty("width");
      }

      if (h > 0) {
        tableElement.style.setProperty("height", `${h}px`, "important");
      } else {
        tableElement.style.removeProperty("height");
      }
    };

    applyDimensions();

    // Re-apply dimensions after Lexical reconciles the DOM (e.g., after column removal)
    const observer = new MutationObserver(applyDimensions);
    observer.observe(tableElement, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [editor, nodeKey, dimensions.width, dimensions.height]);

  return { dimensions, setDimensions, currentDimensions };
}
