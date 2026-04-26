import { ImageNode } from "../imagenode/imageNode";

const $createImageNode = (src: string) : ImageNode => {
    return new ImageNode(src);
}

export {$createImageNode};