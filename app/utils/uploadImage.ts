import { $insertNodes, LexicalEditor } from "lexical";
import { ChangeEvent } from "react";
import { $createImageNode } from "../customnodes/utils/customNodeUtils";

const onUploadImage = (
  event: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  editor: LexicalEditor,
) => {
  const files = event.target.files;
  if (!files) return;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (!base64) return;
      editor.update(() => {
        const imageNode = $createImageNode(base64.toString());
        $insertNodes([imageNode]);
      });
    };
    reader.readAsDataURL(file);
  }
};

export { onUploadImage };
