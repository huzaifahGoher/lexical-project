import { useState, useEffect, RefObject, MutableRefObject } from "react";
import { LexicalEditor } from "lexical";
import { HoverState, CellHoverState } from "../types/tableDecoratorTypes";
import { BORDER_HOVER_THRESHOLD } from "../constants/tableDecoratorConstants";

interface UseTableHoverParams {
  editor: LexicalEditor;
  nodeKey: string;
  overlayRef: RefObject<HTMLDivElement | null>;
  isResizingRef: MutableRefObject<boolean>;
  isHoveringButtonRef: MutableRefObject<boolean>;
}

interface UseTableHoverReturn {
  columnHoverState: HoverState;
  setColumnHoverState: React.Dispatch<React.SetStateAction<HoverState>>;
  rowHoverState: HoverState;
  setRowHoverState: React.Dispatch<React.SetStateAction<HoverState>>;
  cellHoverState: CellHoverState;
  setCellHoverState: React.Dispatch<React.SetStateAction<CellHoverState>>;
}

export function useTableHover({
  editor,
  nodeKey,
  overlayRef,
  isResizingRef,
  isHoveringButtonRef,
}: UseTableHoverParams): UseTableHoverReturn {
  const [columnHoverState, setColumnHoverState] = useState<HoverState>({
    visible: false,
    type: "column",
    position: { top: 0, left: 0 },
    index: 0,
  });
  const [rowHoverState, setRowHoverState] = useState<HoverState>({
    visible: false,
    type: "row",
    position: { top: 0, left: 0 },
    index: 0,
  });
  const [cellHoverState, setCellHoverState] = useState<CellHoverState>({
    visible: false,
    rowIndex: 0,
    colIndex: 0,
    removeColPosition: { top: 0, left: 0 },
    removeRowPosition: { top: 0, left: 0 },
  });

  // Combined border hover detection: track mouse position relative to the
  // table DOM element and detect proximity to both vertical and horizontal borders.
  // Only one insertion button is shown at a time (whichever border is closer).
  useEffect(() => {
    const tableElement = editor.getElementByKey(nodeKey);
    if (!tableElement) return;

    const handleMouseMove = (event: MouseEvent) => {
      const overlayEl = overlayRef.current;
      if (!overlayEl) return;

      // Don't show hover buttons while resizing
      if (isResizingRef.current) return;

      const tableRect = tableElement.getBoundingClientRect();
      const overlayRect = overlayEl.getBoundingClientRect();
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Check if mouse is within the table bounds
      if (
        mouseX < tableRect.left || mouseX > tableRect.right ||
        mouseY < tableRect.top || mouseY > tableRect.bottom
      ) {
        if (columnHoverState.visible) setColumnHoverState((prev) => ({ ...prev, visible: false }));
        if (rowHoverState.visible) setRowHoverState((prev) => ({ ...prev, visible: false }));
        return;
      }

      // Find closest vertical border
      let closestColDist = Infinity;
      let closestColIndex = -1;
      let closestColX = 0;

      const firstRow = tableElement.querySelector("tr");
      if (firstRow) {
        const cells = firstRow.querySelectorAll("td, th");
        for (let i = 0; i < cells.length - 1; i++) {
          const cellRect = cells[i].getBoundingClientRect();
          const borderX = cellRect.right;
          const dist = Math.abs(mouseX - borderX);
          if (dist < closestColDist) {
            closestColDist = dist;
            closestColIndex = i;
            closestColX = borderX;
          }
        }
      }

      // Find closest horizontal border
      let closestRowDist = Infinity;
      let closestRowIndex = -1;
      let closestRowY = 0;

      const rows = tableElement.querySelectorAll("tr");
      for (let i = 0; i < rows.length - 1; i++) {
        const rowRect = rows[i].getBoundingClientRect();
        const borderY = rowRect.bottom;
        const dist = Math.abs(mouseY - borderY);
        if (dist < closestRowDist) {
          closestRowDist = dist;
          closestRowIndex = i;
          closestRowY = borderY;
        }
      }

      // Determine which border is closer and within threshold.
      // Only show ONE button at a time to avoid conflicts.
      const colInThreshold = closestColDist <= BORDER_HOVER_THRESHOLD;
      const rowInThreshold = closestRowDist <= BORDER_HOVER_THRESHOLD;

      if (colInThreshold && rowInThreshold) {
        // Both in threshold — show whichever is closer
        if (closestColDist <= closestRowDist) {
          // Show column button, hide row button
          const left = closestColX - overlayRect.left;
          const top = (tableRect.top + tableRect.bottom) / 2 - overlayRect.top;
          setColumnHoverState({ visible: true, type: "column", position: { top, left }, index: closestColIndex });
          if (rowHoverState.visible) setRowHoverState((prev) => ({ ...prev, visible: false }));
        } else {
          // Show row button, hide column button
          const top = closestRowY - overlayRect.top;
          const left = (tableRect.left + tableRect.right) / 2 - overlayRect.left;
          setRowHoverState({ visible: true, type: "row", position: { top, left }, index: closestRowIndex });
          if (columnHoverState.visible) setColumnHoverState((prev) => ({ ...prev, visible: false }));
        }
      } else if (colInThreshold) {
        // Only column border in threshold
        const left = closestColX - overlayRect.left;
        const top = (tableRect.top + tableRect.bottom) / 2 - overlayRect.top;
        setColumnHoverState({ visible: true, type: "column", position: { top, left }, index: closestColIndex });
        if (rowHoverState.visible) setRowHoverState((prev) => ({ ...prev, visible: false }));
      } else if (rowInThreshold) {
        // Only row border in threshold
        const top = closestRowY - overlayRect.top;
        const left = (tableRect.left + tableRect.right) / 2 - overlayRect.left;
        setRowHoverState({ visible: true, type: "row", position: { top, left }, index: closestRowIndex });
        if (columnHoverState.visible) setColumnHoverState((prev) => ({ ...prev, visible: false }));
      } else {
        // Neither in threshold — hide both insertion buttons
        if (columnHoverState.visible) setColumnHoverState((prev) => ({ ...prev, visible: false }));
        if (rowHoverState.visible) setRowHoverState((prev) => ({ ...prev, visible: false }));
      }

      // Cell hover detection for remove buttons:
      // When cursor is inside a cell, show remove buttons outside the table.
      // Find which cell the cursor is in.
      const allRows = tableElement.querySelectorAll("tr");
      let foundCell = false;

      for (let rowIdx = 0; rowIdx < allRows.length; rowIdx++) {
        const cells = allRows[rowIdx].querySelectorAll("td, th");
        for (let colIdx = 0; colIdx < cells.length; colIdx++) {
          const cellRect = cells[colIdx].getBoundingClientRect();
          if (
            mouseX >= cellRect.left && mouseX <= cellRect.right &&
            mouseY >= cellRect.top && mouseY <= cellRect.bottom
          ) {
            // Cursor is in this cell — compute remove button positions
            const cellCenterX = (cellRect.left + cellRect.right) / 2;
            const cellCenterY = (cellRect.top + cellRect.bottom) / 2;

            // Remove-column button: on the top border of the table, centered on this column
            const removeColTop = tableRect.top - overlayRect.top;
            const removeColLeft = cellCenterX - overlayRect.left;

            // Remove-row button: on the left border of the table, centered on this row
            const removeRowTop = cellCenterY - overlayRect.top;
            const removeRowLeft = tableRect.left - overlayRect.left;

            setCellHoverState({
              visible: true,
              rowIndex: rowIdx,
              colIndex: colIdx,
              removeColPosition: { top: removeColTop, left: removeColLeft },
              removeRowPosition: { top: removeRowTop, left: removeRowLeft },
            });
            foundCell = true;
            break;
          }
        }
        if (foundCell) break;
      }

      if (!foundCell && cellHoverState.visible) {
        // Don't hide if cursor is over a remove button
        if (!isHoveringButtonRef.current) {
          setCellHoverState((prev) => ({ ...prev, visible: false }));
        }
      }
    };

    const handleMouseLeave = () => {
      // Don't hide buttons if cursor moved onto the button itself.
      // Use a small delay to allow mouseenter on the button to fire first.
      setTimeout(() => {
        if (isHoveringButtonRef.current) return;
        setColumnHoverState((prev) => ({ ...prev, visible: false }));
        setRowHoverState((prev) => ({ ...prev, visible: false }));
        setCellHoverState((prev) => ({ ...prev, visible: false }));
      }, 50);
    };

    tableElement.addEventListener("mousemove", handleMouseMove);
    tableElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      tableElement.removeEventListener("mousemove", handleMouseMove);
      tableElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor, nodeKey, columnHoverState.visible, rowHoverState.visible, cellHoverState.visible, overlayRef, isResizingRef, isHoveringButtonRef]);

  return {
    columnHoverState,
    setColumnHoverState,
    rowHoverState,
    setRowHoverState,
    cellHoverState,
    setCellHoverState,
  };
}
