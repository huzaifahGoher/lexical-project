import {
  SerializedTableCellNode,
  SerializedTableNode,
  SerializedTableRowNode,
} from "@lexical/table";
import { DecoratorNode, SerializedLexicalNode, Spread } from "lexical";
import { JSX } from "react";

type ImageNodeType = Spread<{ __src: string }, DecoratorNode<JSX.Element>>;
type SerializedImageNodeType = Spread<
  SerializedLexicalNode,
  { src: string; width?: number; height?: number }
>;
type SerializedTableNodeType = Spread<SerializedTableNode, {
  width?: number | null;
  height?: number | null;
}>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type SerializedTableRowNodeType = Spread<SerializedTableRowNode, {}>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type SerializedTableCellNodeType = Spread<SerializedTableCellNode, {}>;

export type {
  ImageNodeType,
  SerializedImageNodeType,
  SerializedTableNodeType,
  SerializedTableCellNodeType,
  SerializedTableRowNodeType,
};
