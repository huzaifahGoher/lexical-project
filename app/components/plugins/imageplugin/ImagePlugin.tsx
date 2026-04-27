"use client";
import React, { useEffect } from "react";
import { $createImageNode } from "@/app/customnodes/utils/customNodeUtils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, COMMAND_PRIORITY_LOW, PASTE_COMMAND } from "lexical";

const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.registerCommand(
      PASTE_COMMAND,
      (payload: ClipboardEvent) => {
        const items = payload.clipboardData?.items;
        if (!items) return false;
        
        // Check if there's an image first - prioritize image over text
        let hasImage = false;
        for (const item of items) {
          if (item.type.includes("image")) {
            hasImage = true;
            break;
          }
        }
        
        for (const item of items) {
          if (item.type.includes("image")) {
            payload.preventDefault();
            payload.stopPropagation();
            const file = item.getAsFile();
            if (file) {
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
            return true; // Stop processing other items
          } else if (item.type.includes("text") && !hasImage) {
            // Only process text if there's no image
            item.getAsString((data: string) => {
              if (!data || !data.startsWith('http')) return; // Only process URLs
              payload.preventDefault();
              payload.stopPropagation();
              editor.update(() => {
                const imageNode = $createImageNode(data);
                $insertNodes([imageNode]);
              });
            });
            return true;
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
