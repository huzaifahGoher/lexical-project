import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
import { customNodesConstants } from "../constants/customNodeConstants";
import {
  SerializedTableCellNodeType,
  SerializedTableNodeType,
  SerializedTableRowNodeType,
} from "../types/customNodeTypes";
import { EditorConfig, LexicalEditor } from "lexical";

// ─── Table ───────────────────────────────────────────────────────────────────

export class CustomTableNode extends TableNode {
  static getType(): string {
    return customNodesConstants.TABLE.TYPE;
  }

  static clone(node: CustomTableNode): CustomTableNode {
    return new CustomTableNode(node.__key);
  }

  exportJSON(): SerializedTableNodeType {
    return { ...super.exportJSON(), type: customNodesConstants.TABLE.TYPE };
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    return super.createDOM(config, editor);
  }

  static importJSON(serializedNode: SerializedTableNodeType): CustomTableNode {
    return new CustomTableNode();
  }
}

// ─── Row ─────────────────────────────────────────────────────────────────────

export class CustomTableRowNode extends TableRowNode {
  static getType(): string {
    return customNodesConstants.TABLE.ROW_TYPE;
  }

  static clone(node: CustomTableRowNode): CustomTableRowNode {
    return new CustomTableRowNode(node.__height, node.__key);
  }

  exportJSON(): SerializedTableRowNodeType {
    return { ...super.exportJSON(), type: customNodesConstants.TABLE.ROW_TYPE };
  }

  createDOM(config: EditorConfig): HTMLElement {
    return super.createDOM(config);
  }

  static importJSON(
    serializedNode: SerializedTableRowNodeType
  ): CustomTableRowNode {
    return new CustomTableRowNode(serializedNode.height);
  }
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

export class CustomTableCellNode extends TableCellNode {
  static getType(): string {
    return customNodesConstants.TABLE.CELL_TYPE;
  }

  static clone(node: CustomTableCellNode): CustomTableCellNode {
    return new CustomTableCellNode(
      node.__headerState,
      node.__colSpan,
      node.__width,
      node.__key
    );
  }

  exportJSON(): SerializedTableCellNodeType {
    return {
      ...super.exportJSON(),
      type: customNodesConstants.TABLE.CELL_TYPE,
    };
  }

  createDOM(config: EditorConfig): HTMLTableCellElement {
    return super.createDOM(config);
  }

  static importJSON(
    serializedNode: SerializedTableCellNodeType
  ): CustomTableCellNode {
    return new CustomTableCellNode(
      serializedNode.headerState,
      serializedNode.colSpan,
      serializedNode.width ?? undefined
    );
  }
}
