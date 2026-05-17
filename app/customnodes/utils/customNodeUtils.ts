import { ImageNode } from "../imagenode/imageNode";
import { CustomLinkNode } from "../linknode/linkNode";
import { CustomTableNode, CustomTableRowNode, CustomTableCellNode } from "../tablenode/tableNode";
import { TableCellHeaderStates } from "@lexical/table";

const $createImageNode = (src: string, width?: number, height?: number): ImageNode => {
    return new ImageNode(src, width, height);
}

const $isImageNode = (node: any): boolean => {
    return node instanceof ImageNode;
}

const $createCustomTableNode = (): CustomTableNode => {
    return new CustomTableNode();
}

const $createCustomTableRowNode = (): CustomTableRowNode => {
    return new CustomTableRowNode();
}

const $createCustomTableCellNode = (headerState = TableCellHeaderStates.NO_STATUS): CustomTableCellNode => {
    return new CustomTableCellNode(headerState);
}

const $isCustomTableNode = (node: any): boolean => node instanceof CustomTableNode;
const $isCustomTableRowNode = (node: any): boolean => node instanceof CustomTableRowNode;
const $isCustomTableCellNode = (node: any): boolean => node instanceof CustomTableCellNode;

const $createCustomLinkNode = (href: string): CustomLinkNode => {
    return new CustomLinkNode(href);
}

const $isCustomLinkNode = (node: any): boolean => {
    return node instanceof CustomLinkNode;
}

export {
    $createImageNode, $isImageNode,
    $createCustomTableNode, $createCustomTableRowNode, $createCustomTableCellNode,
    $isCustomTableNode, $isCustomTableRowNode, $isCustomTableCellNode,
    $createCustomLinkNode, $isCustomLinkNode
};