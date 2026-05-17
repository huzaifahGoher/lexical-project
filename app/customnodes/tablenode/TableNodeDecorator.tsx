import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "@huzaifah191001/design-library";
import "./TableNodeDecorator.css";

import { HoverState, TableNodeDecoratorProps } from "./types/tableDecoratorTypes";
import { useTableSelection } from "./hooks/useTableSelection";
import { useTablePosition } from "./hooks/useTablePosition";
import { useTableDimensions } from "./hooks/useTableDimensions";
import { useTableHover } from "./hooks/useTableHover";
import { useTableResize } from "./hooks/useTableResize";
import { insertColumn, insertRow, removeColumn, removeRow } from "./utils/tableDecoratorUtils";
import { InsertionButton } from "./components/InsertionButton";
import { RemovalButton } from "./components/RemovalButton";

export type { HoverState } from "./types/tableDecoratorTypes";

export function TableNodeDecorator({
  nodeKey,
  width,
  height,
  editor,
}: TableNodeDecoratorProps): React.JSX.Element {
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const overlayRef = useRef<HTMLDivElement>(null);
  const isHoveringButtonRef = useRef(false);
  const isResizingRef = useRef(false);
  const themeStyles = useTheme();

  // Derive accent color from theme, with fallback
  const accentColor = themeStyles?.colors?.actionPrimary ?? "#007acc";
  // Derive accent foreground color for contrasting text on accent background
  const accentForeground = themeStyles?.colors?.textOnAccent ?? "#ffffff";
  // Derive primary color for resize handle from theme, with fallback
  const primaryColor = themeStyles?.colors?.actionPrimary ?? "#007acc";

  // Listen for editability changes and update state accordingly.
  // When the editor becomes read-only, interactive controls (resize handle,
  // insertion buttons) are hidden to prevent modification attempts.
  useEffect(() => {
    return editor.registerEditableListener((editable) => {
      setIsEditable(editable);
    });
  }, [editor]);

  const { isSelected, handleClick } = useTableSelection({
    editor,
    nodeKey,
    overlayRef,
  });

  const { dimensions, setDimensions, currentDimensions } = useTableDimensions({
    editor,
    nodeKey,
    width,
    height,
  });

  const overlayPosition = useTablePosition({
    editor,
    nodeKey,
    dimensionsWidth: dimensions.width,
    dimensionsHeight: dimensions.height,
  });

  const {
    columnHoverState,
    setColumnHoverState,
    rowHoverState,
    setRowHoverState,
    cellHoverState,
    setCellHoverState,
  } = useTableHover({
    editor,
    nodeKey,
    overlayRef,
    isResizingRef,
    isHoveringButtonRef,
  });

  const handleResizeMouseDown = useTableResize({
    editor,
    nodeKey,
    dimensions,
    currentDimensions,
    setDimensions,
    setColumnHoverState,
    setRowHoverState,
    setCellHoverState,
    isResizingRef,
  });

  // Column insertion handler
  const handleInsertColumn = useCallback(() => {
    insertColumn(editor, nodeKey, columnHoverState.index);
    setColumnHoverState((prev) => ({ ...prev, visible: false }));
  }, [editor, nodeKey, columnHoverState.index, setColumnHoverState]);

  // Row insertion handler
  const handleInsertRow = useCallback(() => {
    insertRow(editor, nodeKey, rowHoverState.index);
    setRowHoverState((prev) => ({ ...prev, visible: false }));
  }, [editor, nodeKey, rowHoverState.index, setRowHoverState]);

  // Column removal handler
  const handleRemoveColumn = useCallback(() => {
    removeColumn(editor, nodeKey, cellHoverState.colIndex);
    setCellHoverState((prev) => ({ ...prev, visible: false }));
  }, [editor, nodeKey, cellHoverState.colIndex, setCellHoverState]);

  // Row removal handler
  const handleRemoveRow = useCallback(() => {
    removeRow(editor, nodeKey, cellHoverState.rowIndex);
    setCellHoverState((prev) => ({ ...prev, visible: false }));
  }, [editor, nodeKey, cellHoverState.rowIndex, setCellHoverState]);

  // Build inline style for live preview during resize.
  // Position the overlay absolutely over the table element within the editor root.
  const containerStyle: React.CSSProperties & Record<string, string> = {
    "--table-decorator-accent-color": accentColor,
    "--table-decorator-primary-color": primaryColor,
    "--table-decorator-foreground-color": accentForeground,
    top: `${overlayPosition.top}px`,
    left: `${overlayPosition.left}px`,
    width: dimensions.width !== null
      ? `${dimensions.width}px`
      : `${overlayPosition.width}px`,
    height: dimensions.height !== null
      ? `${dimensions.height}px`
      : `${overlayPosition.height}px`,
  };

  return (
    <div
      ref={overlayRef}
      className={`table-decorator-overlay ${isSelected ? "selected" : ""}`}
      style={containerStyle as React.CSSProperties}
    >
      {/* Click areas for selecting the table - positioned as strips around the table edges */}
      <div className="selection-click-area">
        <div className="selection-click-area-top" onClick={handleClick} />
        <div className="selection-click-area-bottom" onClick={handleClick} />
        <div className="selection-click-area-left" onClick={handleClick} />
        <div className="selection-click-area-right" onClick={handleClick} />
      </div>

      {/* Resize handle - visible when editor is editable */}
      {isEditable && (
        <div
          className="table-resize-handle"
          onMouseDown={handleResizeMouseDown}
          role="button"
          aria-label="Resize table from bottom-right corner"
          tabIndex={0}
        />
      )}

      {/* Column insertion button - visible when hovering near a vertical border and editor is editable */}
      {isEditable && columnHoverState.visible && (
        <InsertionButton
          position={columnHoverState.position}
          onClick={handleInsertColumn}
          accentColor={accentColor}
          accentForeground={accentForeground}
          title="Insert column"
          ariaLabel="Insert column"
          onMouseEnter={() => { isHoveringButtonRef.current = true; }}
          onMouseLeave={() => {
            isHoveringButtonRef.current = false;
            setColumnHoverState((prev) => ({ ...prev, visible: false }));
          }}
        />
      )}

      {/* Row insertion button - visible when hovering near a horizontal border and editor is editable */}
      {isEditable && rowHoverState.visible && (
        <InsertionButton
          position={rowHoverState.position}
          onClick={handleInsertRow}
          accentColor={accentColor}
          accentForeground={accentForeground}
          title="Insert row"
          ariaLabel="Insert row"
          onMouseEnter={() => { isHoveringButtonRef.current = true; }}
          onMouseLeave={() => {
            isHoveringButtonRef.current = false;
            setRowHoverState((prev) => ({ ...prev, visible: false }));
          }}
        />
      )}

      {/* Remove column button - appears above the hovered column */}
      {isEditable && cellHoverState.visible && (
        <RemovalButton
          position={cellHoverState.removeColPosition}
          onClick={handleRemoveColumn}
          title="Remove column"
          ariaLabel="Remove column"
          onMouseEnter={() => { isHoveringButtonRef.current = true; }}
          onMouseLeave={() => {
            isHoveringButtonRef.current = false;
            setCellHoverState((prev) => ({ ...prev, visible: false }));
          }}
        />
      )}

      {/* Remove row button - appears to the left of the hovered row */}
      {isEditable && cellHoverState.visible && (
        <RemovalButton
          position={cellHoverState.removeRowPosition}
          onClick={handleRemoveRow}
          title="Remove row"
          ariaLabel="Remove row"
          onMouseEnter={() => { isHoveringButtonRef.current = true; }}
          onMouseLeave={() => {
            isHoveringButtonRef.current = false;
            setCellHoverState((prev) => ({ ...prev, visible: false }));
          }}
        />
      )}
    </div>
  );
}
