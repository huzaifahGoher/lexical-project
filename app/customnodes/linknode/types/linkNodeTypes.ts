import { LexicalEditor, SerializedLexicalNode } from "lexical";

export enum FetchStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface PreviewMetadata {
  title: string | null;
  description: string | null;
  favicon: string | null;
  image: string | null;
  domain: string;
}

export interface SerializedCustomLinkNode extends SerializedLexicalNode {
  type: "customLinkNode";
  href: string;
  target: string | null;
  rel: string | null;
  previewMetadata: PreviewMetadata | null;
  fetchStatus: FetchStatus;
  fetchTimestamp: number | null;
}

export interface CustomLinkNodeConfig {
  href: string;
  target: string | null;
  rel: string | null;
  previewMetadata: PreviewMetadata | null;
  fetchStatus: FetchStatus;
  fetchTimestamp: number | null;
}

export interface LinkPreviewCardProps {
  nodeKey: string;
  href: string;
  target: string | null;
  rel: string | null;
  previewMetadata: PreviewMetadata | null;
  fetchStatus: FetchStatus;
  editor: LexicalEditor;
  anchorElement: HTMLElement;
  onClose: () => void;
}

export interface LinkPreviewAPIResponse {
  title: string | null;
  description: string | null;
  favicon: string | null;
  image: string | null;
  domain: string;
  error?: string;
}
