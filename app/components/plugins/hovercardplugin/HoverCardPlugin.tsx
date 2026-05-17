"use client";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
} from "lexical";
import {
  CustomLinkNode,
  $createCustomLinkNode,
} from "@/app/customnodes/linknode/linkNode";
import { isStandaloneUrl } from "@/app/customnodes/linknode/utils/linkNodeUtils";

const HoverCardPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // We intercept paste via a native DOM listener on the editor root element.
    // This runs BEFORE Lexical's internal event handler dispatches PASTE_COMMAND,
    // so clipboardData is still available and not consumed.
    // If the pasted text is a standalone URL, we handle it ourselves and
    // prevent the event from reaching Lexical's default paste handling.
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handlePaste = (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      // Check if clipboard contains image items — skip if so (let ImagePlugin handle it)
      const hasImageItem =
        clipboardData.types.includes("Files") ||
        Array.from(clipboardData.items).some((item) =>
          item.type.startsWith("image/")
        );

      if (hasImageItem) {
        return; // Let the event propagate to Lexical's normal handling
      }

      // Extract text from clipboard
      const text = clipboardData.getData("text/plain");
      if (!text) return;

      // Validate if the text is a standalone URL
      if (!isStandaloneUrl(text)) {
        return; // Let the event propagate to Lexical's normal handling
      }

      // It's a standalone URL — prevent default and Lexical's handling
      event.preventDefault();
      event.stopPropagation();

      // Create a CustomLinkNode
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = $createCustomLinkNode(text.trim());
          selection.insertNodes([node]);
        }
      });
    };

    // Use capture phase to run before Lexical's event handler
    rootElement.addEventListener("paste", handlePaste, true);

    // Register mutation listener for CustomLinkNode to handle cleanup when nodes are removed
    const unregisterMutationListener = editor.registerMutationListener(
      CustomLinkNode,
      (mutatedNodes) => {
        for (const [, mutation] of mutatedNodes) {
          if (mutation === "destroyed") {
            // Cleanup handled by decorator unmount lifecycle
          }
        }
      }
    );

    return () => {
      rootElement.removeEventListener("paste", handlePaste, true);
      unregisterMutationListener();
    };
  }, [editor]);

  return null;
};

export default HoverCardPlugin;
