import {
  DecoratorNode,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  SerializedLexicalNode,
} from "lexical";
import React, { JSX } from "react";
import { customNodesConstants } from "../constants/customNodeConstants";
import {
  ImageNodeType,
  SerializedImageNodeType,
} from "../types/customNodeTypes";
import { $createImageNode } from "../utils/customNodeUtils";
import { ImageNodeDecorator } from "./ImageNodeDecorator";

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __width: number;
  __height: number;

  constructor(src = "", width = 200, height = 150, key?: string) {
    super(key);
    this.__src = src;
    this.__width = width;
    this.__height = height;
  }

  static getType(): string {
    return customNodesConstants.IMAGE.TYPE;
  }

  static clone(node: ImageNode): LexicalNode {
    return new ImageNode(node.__src, node.__width, node.__height, node.__key);
  }

  exportJSON(): SerializedImageNodeType {
    return {
      ...super.exportJSON(),
      ...{ src: this.__src, width: this.__width, height: this.__height },
    };
  }

  static importJSON(serializedNode: SerializedImageNodeType): ImageNode {
    return $createImageNode(serializedNode.src, serializedNode.width, serializedNode.height);
  }

  setSrc(src: string): void {
    const writeable = this.getWritable();
    writeable.__src = src;
  }

  getSrc(): string {
    const latest = this.getLatest();
    return latest.__src;
  }

  setWidth(width: number): void {
    const writeable = this.getWritable();
    writeable.__width = width;
  }

  getWidth(): number {
    const latest = this.getLatest();
    return latest.__width;
  }

  setHeight(height: number): void {
    const writeable = this.getWritable();
    writeable.__height = height;
  }

  getHeight(): number {
    const latest = this.getLatest();
    return latest.__height;
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement("div");
    div.style.display = "inline-block";
    return div;
  }

  updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return React.createElement(ImageNodeDecorator, { 
      // editor, 
      nodeKey: this.getKey(),
      src: this.__src,
      width: this.__width,
      height: this.__height
    });
  }
}
