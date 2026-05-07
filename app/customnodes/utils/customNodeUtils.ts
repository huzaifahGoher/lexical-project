import { LexicalNode } from "lexical";
import { ImageNode } from "../imagenode/imageNode";

const $createImageNode = (src: string, width?: number, height?: number) : ImageNode => {
    return new ImageNode(src, width, height);
}

const $isImageNode = (node: any) : boolean => {
    return node instanceof ImageNode;
}

export {$createImageNode, $isImageNode};