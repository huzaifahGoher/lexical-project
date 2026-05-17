import { LexicalEditor } from "lexical";

export interface HoverState {
  visible: boolean;
  type: "column" | "row";
  position: { top: number; left: number };
  index: number; // column index after which to insert
}

export interface CellHoverState {
  visible: boolean;
  rowIndex: number;
  colIndex: number;
  // Position for the remove-column button (above the column, centered)
  removeColPosition: { top: number; left: number };
  // Position for the remove-row button (left of the row, centered)
  removeRowPosition: { top: number; left: number };
}

export type TableNodeDecoratorProps = {
  nodeKey: string;
  width: number | null;
  height: number | null;
  editor: LexicalEditor;
};

export interface InsertionButtonProps {
  position: { top: number; left: number };
  onClick: () => void;
  accentColor: string;
  accentForeground: string;
  ariaLabel?: string;
  title?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export interface RemovalButtonProps {
  position: { top: number; left: number };
  onClick: () => void;
  ariaLabel?: string;
  title?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}
