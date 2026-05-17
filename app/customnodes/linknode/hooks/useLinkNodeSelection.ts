import { useEffect, useState } from "react";
import {
  LexicalEditor,
  $getNodeByKey,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical";

interface UseLinkNodeSelectionParams {
  nodeKey: string;
  editor: LexicalEditor;
}

/**
 * Tracks whether a link node is selected and applies visual styling.
 * Also handles Delete/Backspace to remove the node when selected.
 */
export function useLinkNodeSelection({
  nodeKey,
  editor,
}: UseLinkNodeSelectionParams): boolean {
  const [isSelected, setIsSelected] = useState(false);

  // Selection tracking + delete/backspace handlers
  useEffect(() => {
    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const currentNode = $getNodeByKey(nodeKey);
          const selection = $getSelection();
          if (currentNode && selection) {
            setIsSelected(currentNode.isSelected(selection));
          } else {
            setIsSelected(false);
          }
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const removeDeleteListener = editor.registerCommand(
      KEY_DELETE_COMMAND,
      () => {
        if (isSelected) {
          editor.update(() => {
            const currentNode = $getNodeByKey(nodeKey);
            if (currentNode) {
              currentNode.remove();
              editor.focus();
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const removeBackspaceListener = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      () => {
        if (isSelected) {
          editor.update(() => {
            const currentNode = $getNodeByKey(nodeKey);
            if (currentNode) {
              currentNode.remove();
              editor.focus();
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeSelectionListener();
      removeDeleteListener();
      removeBackspaceListener();
    };
  }, [editor, nodeKey, isSelected]);

  // Apply/remove selected styling on the anchor DOM element
  useEffect(() => {
    const element = editor.getElementByKey(nodeKey);
    if (!element) return;

    if (isSelected) {
      element.style.borderColor = "#0369a1";
      element.style.boxShadow = "0 0 0 2px rgba(3, 105, 161, 0.3)";
    } else {
      element.style.borderColor = "#7dd3fc";
      element.style.boxShadow = "none";
    }
  }, [isSelected, editor, nodeKey]);

  return isSelected;
}
