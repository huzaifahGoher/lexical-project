import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
} from "lexical";
import React, { JSX } from "react";
import { customNodesConstants } from "../constants/customNodeConstants";
import {
  FetchStatus,
  PreviewMetadata,
  SerializedCustomLinkNode,
} from "./types/linkNodeTypes";
import { normalizeUrl } from "./utils/linkNodeUtils";
import { LinkNodeDecorator } from "./LinkNodeDecorator";

export class CustomLinkNode extends DecoratorNode<JSX.Element | null> {
  __href: string;
  __target: string | null;
  __rel: string | null;
  __previewMetadata: PreviewMetadata | null;
  __fetchStatus: FetchStatus;
  __fetchTimestamp: number | null;

  constructor(
    href: string,
    target: string | null = "_blank",
    rel: string | null = "noopener noreferrer",
    fetchStatus: FetchStatus = FetchStatus.IDLE,
    previewMetadata: PreviewMetadata | null = null,
    fetchTimestamp: number | null = null,
    key?: NodeKey
  ) {
    super(key);
    this.__href = normalizeUrl(href);
    this.__target = target;
    this.__rel = rel;
    this.__previewMetadata = previewMetadata;
    this.__fetchStatus = fetchStatus;
    this.__fetchTimestamp = fetchTimestamp;
  }

  static getType(): string {
    return customNodesConstants.LINK.TYPE;
  }

  static clone(node: CustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(
      node.__href,
      node.__target,
      node.__rel,
      node.__fetchStatus,
      node.__previewMetadata,
      node.__fetchTimestamp,
      node.__key
    );
  }

  // --- Getters ---

  getHref(): string {
    const latest = this.getLatest();
    return latest.__href;
  }

  getTarget(): string | null {
    const latest = this.getLatest();
    return latest.__target;
  }

  getRel(): string | null {
    const latest = this.getLatest();
    return latest.__rel;
  }

  getPreviewMetadata(): PreviewMetadata | null {
    const latest = this.getLatest();
    return latest.__previewMetadata;
  }

  getFetchStatus(): FetchStatus {
    const latest = this.getLatest();
    return latest.__fetchStatus;
  }

  getFetchTimestamp(): number | null {
    const latest = this.getLatest();
    return latest.__fetchTimestamp;
  }

  // --- Setters ---

  setHref(href: string): void {
    const writable = this.getWritable();
    const normalizedHref = normalizeUrl(href);
    if (writable.__href !== normalizedHref) {
      writable.__href = normalizedHref;
      writable.__fetchStatus = FetchStatus.IDLE;
      writable.__previewMetadata = null;
    }
  }

  setTarget(target: string | null): void {
    const writable = this.getWritable();
    writable.__target = target;
  }

  setRel(rel: string | null): void {
    const writable = this.getWritable();
    writable.__rel = rel;
  }

  setPreviewMetadata(metadata: PreviewMetadata | null): void {
    const writable = this.getWritable();
    writable.__previewMetadata = metadata;
  }

  setFetchStatus(status: FetchStatus): void {
    const writable = this.getWritable();
    writable.__fetchStatus = status;
  }

  setFetchTimestamp(timestamp: number | null): void {
    const writable = this.getWritable();
    writable.__fetchTimestamp = timestamp;
  }

  // --- DOM Methods ---

  createDOM(config: EditorConfig): HTMLElement {
    const anchor = document.createElement("a");
    anchor.href = this.__href;
    anchor.textContent = this.__href;
    anchor.setAttribute("aria-label", `Link: ${this.__href}`);

    if (this.__target) {
      anchor.target = this.__target;
    }
    if (this.__rel) {
      anchor.rel = this.__rel;
    }

    // Apply styling for link distinction
    anchor.style.color = "#0369a1";
    anchor.style.textDecoration = "none";
    anchor.style.cursor = "pointer";
    anchor.style.backgroundColor = "#e0f2fe";
    anchor.style.border = "1px solid #7dd3fc";
    anchor.style.borderRadius = "4px";
    anchor.style.padding = "2px 6px";

    return anchor;
  }

  updateDOM(
    prevNode: CustomLinkNode,
    dom: HTMLElement,
    _config: EditorConfig
  ): boolean {
    const anchor = dom as HTMLAnchorElement;

    if (prevNode.__href !== this.__href) {
      anchor.href = this.__href;
      anchor.textContent = this.__href;
      anchor.setAttribute("aria-label", `Link: ${this.__href}`);
    }

    if (prevNode.__target !== this.__target) {
      if (this.__target) {
        anchor.target = this.__target;
      } else {
        anchor.removeAttribute("target");
      }
    }

    if (prevNode.__rel !== this.__rel) {
      if (this.__rel) {
        anchor.rel = this.__rel;
      } else {
        anchor.removeAttribute("rel");
      }
    }

    return false;
  }

  // --- Serialization Methods ---

  exportJSON(): SerializedCustomLinkNode {
    return {
      ...super.exportJSON(),
      type: customNodesConstants.LINK.TYPE as "customLinkNode",
      href: this.__href,
      target: this.__target,
      rel: this.__rel,
      previewMetadata: this.__previewMetadata,
      fetchStatus: this.__fetchStatus,
      fetchTimestamp: this.__fetchTimestamp,
    };
  }

  static importJSON(serializedNode: SerializedCustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(
      serializedNode.href,
      serializedNode.target,
      serializedNode.rel,
      serializedNode.fetchStatus,
      serializedNode.previewMetadata,
      serializedNode.fetchTimestamp
    );
  }

  exportDOM(): DOMExportOutput {
    const anchor = document.createElement("a");
    anchor.href = this.__href;

    if (this.__target !== null) {
      anchor.target = this.__target;
    }
    if (this.__rel !== null) {
      anchor.rel = this.__rel;
    }

    return { element: anchor };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: () => ({
        conversion: convertAnchorElement,
        priority: 1,
      }),
    };
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): JSX.Element | null {
    return React.createElement(LinkNodeDecorator, {
      nodeKey: this.__key,
      editor,
    });
  }

  isInline(): boolean {
    return true;
  }
}

// --- DOM Conversion Helper ---

function convertAnchorElement(domNode: HTMLElement): DOMConversionOutput {
  const anchor = domNode as HTMLAnchorElement;
  const href = anchor.getAttribute("href") || "";
  const target = anchor.getAttribute("target") || null;
  const rel = anchor.getAttribute("rel") || null;

  const node = new CustomLinkNode(
    href,
    target,
    rel,
    FetchStatus.IDLE,
    null,
    null
  );

  return { node };
}

// --- Helper functions ---

export function $createCustomLinkNode(href: string): CustomLinkNode {
  return new CustomLinkNode(href);
}

export function $isCustomLinkNode(node: LexicalNode | null | undefined): node is CustomLinkNode {
  return node instanceof CustomLinkNode;
}
