'use client'
import React, { useEffect } from "react";
import { $createImageNode } from "@/app/customnodes/utils/customNodeUtils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";

const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.registerCommand(
      PASTE_COMMAND,
      (payload: ClipboardEvent) => {
        const items = payload.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result;
              if (!base64) return false;
              editor.update(() => {
                const imageNode = $createImageNode(base64.toString());
                $insertNodes([imageNode]);
              });
            };
            const image = reader.readAsDataURL(file);
            console.log(image);
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, []);
  return null;
};

export default ImagePlugin;
