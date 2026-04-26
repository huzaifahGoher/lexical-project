import {
  DecoratorNode,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  SerializedLexicalNode,
} from "lexical";
import { JSX } from "react";
import { customNodesConstants } from "../constants/customNodeConstants";
import {
  ImageNodeType,
  SerializedImageNodeType,
} from "../types/customNodeTypes";
import { $createImageNode } from "../utils/customNodeUtils";

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;

  constructor(src = "", key?: string) {
    super(key);
    this.__src = src;
  }

  static getType(): string {
    return customNodesConstants.IMAGE.TYPE;
  }

  static clone(node: ImageNodeType): LexicalNode {
    return new ImageNode(node.__src, node.__key);
  }

  exportJSON(): SerializedLexicalNode {
    return {
      ...super.exportJSON(),
      ...{ src: this.__src },
    };
  }

  static importJSON(serializedNode: SerializedImageNodeType): ImageNode {
    return $createImageNode(serializedNode.src);
  }

  setSrc(src: string): void {
    const writeable = this.getWritable();
    writeable.__src = src;
  }

  getSrc(): string {
    const latest = this.getLatest();
    return latest.__src;
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const img = document.createElement("img");
    img.src = this.__src;
    return img;
  }

  updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }
}
