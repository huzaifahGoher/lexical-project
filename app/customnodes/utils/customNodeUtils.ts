import { LexicalNode } from "lexical";
import { ImageNode } from "../imagenode/imageNode";

const $createImageNode = (src: string) : ImageNode => {
    return new ImageNode(src);
}

const $isImageNode = (node: any) : boolean => {
    return node instanceof ImageNode;
}

export {$createImageNode, $isImageNode};