import { $getNodeByKey, LexicalEditor } from "lexical";
import {
  CustomTableNode,
  CustomTableCellNode,
  CustomTableRowNode,
} from "../tableNode";

/**
 * Inserts a new column after the specified column index in every row of the table.
 */
export function insertColumn(
  editor: LexicalEditor,
  nodeKey: string,
  columnIndex: number
): void {
  editor.update(() => {
    const tableNode = $getNodeByKey(nodeKey) as CustomTableNode | null;
    if (!tableNode) return;

    const rows = tableNode.getChildren();
    for (const row of rows) {
      if (row instanceof CustomTableRowNode) {
        const cells = row.getChildren();
        // Create a new cell with default header state (0), colSpan 1
        const newCell = new CustomTableCellNode(0, 1);

        // Insert after the cell at columnIndex
        if (columnIndex < cells.length) {
          const targetCell = cells[columnIndex];
          targetCell.insertAfter(newCell);
        } else {
          // If index is at or beyond the end, append to the row
          row.append(newCell);
        }
      }
    }
  });
}

/**
 * Inserts a new row with the correct number of cells after the target row index.
 */
export function insertRow(
  editor: LexicalEditor,
  nodeKey: string,
  rowIndex: number
): void {
  editor.update(() => {
    const tableNode = $getNodeByKey(nodeKey) as CustomTableNode | null;
    if (!tableNode) return;

    const rows = tableNode.getChildren();
    // Determine the number of cells from an existing row
    let cellCount = 0;
    for (const row of rows) {
      if (row instanceof CustomTableRowNode) {
        cellCount = row.getChildrenSize();
        break;
      }
    }

    // Create a new row with the same number of cells
    const newRow = new CustomTableRowNode();
    for (let i = 0; i < cellCount; i++) {
      const newCell = new CustomTableCellNode(0, 1);
      newRow.append(newCell);
    }

    // Insert after the row at rowIndex
    const targetRow = rows[rowIndex];
    if (targetRow) {
      targetRow.insertAfter(newRow);
    } else {
      // Fallback: append to the table
      tableNode.append(newRow);
    }
  });
}

/**
 * Removes the column at the specified column index from every row of the table.
 */
export function removeColumn(
  editor: LexicalEditor,
  nodeKey: string,
  columnIndex: number
): void {
  editor.update(() => {
    const tableNode = $getNodeByKey(nodeKey) as CustomTableNode | null;
    if (!tableNode) return;

    const rows = tableNode.getChildren();
    for (const row of rows) {
      if (row instanceof CustomTableRowNode) {
        const cells = row.getChildren();
        if (columnIndex < cells.length) {
          cells[columnIndex].remove();
        }
      }
    }
    // Width is preserved — the MutationObserver will re-apply the inline
    // style after Lexical reconciles the DOM.
  });
}

/**
 * Removes the row at the specified row index from the table.
 */
export function removeRow(
  editor: LexicalEditor,
  nodeKey: string,
  rowIndex: number
): void {
  editor.update(() => {
    const tableNode = $getNodeByKey(nodeKey) as CustomTableNode | null;
    if (!tableNode) return;

    const rows = tableNode.getChildren();
    if (rowIndex < rows.length) {
      rows[rowIndex].remove();
    }
  });
}
