import {
  DecoratorNode,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { JSX } from "react";

type ImageNodeType = Spread<{ __src: string }, DecoratorNode<JSX.Element>>;
type SerializedImageNodeType = Spread<SerializedLexicalNode, { src: string; width?: number; height?: number }>;

export type {ImageNodeType,SerializedImageNodeType};