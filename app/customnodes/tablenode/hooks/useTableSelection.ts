import { useState, useCallback, useEffect, RefObject } from "react";
import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

interface UseTableSelectionParams {
  editor: LexicalEditor;
  nodeKey: string;
  overlayRef: RefObject<HTMLDivElement | null>;
}

interface UseTableSelectionReturn {
  isSelected: boolean;
  handleClick: (e: React.MouseEvent) => void;
}

export function useTableSelection({
  editor,
  nodeKey,
  overlayRef,
}: UseTableSelectionParams): UseTableSelectionReturn {
  const [isSelected, setIsSelected] = useState(false);

  // Selection tracking: listen to SELECTION_CHANGE_COMMAND to detect
  // when the table node is node-selected (NodeSelection).
  // Do NOT show border when cells are being edited (RangeSelection inside table).
  useEffect(() => {
    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          const currentNode = $getNodeByKey(nodeKey);

          if (!currentNode || !selection) {
            setIsSelected(false);
            return;
          }

          // Only show selection border when the table is explicitly
          // node-selected via NodeSelection. When a RangeSelection or
          // TableSelection is active (user editing cells), hide the border.
          if ($isNodeSelection(selection)) {
            const isNodeSelected = currentNode.isSelected(selection);
            setIsSelected(isNodeSelected);
          } else {
            // RangeSelection or TableSelection means user is editing cells
            setIsSelected(false);
          }
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    // Delete/Backspace handling: only when the table is node-selected.
    // When cells are being edited (RangeSelection/TableSelection), these
    // commands are NOT intercepted so default cell editing behavior is preserved.
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

  // Click handler to select the table node using NodeSelection
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only handle clicks on the overlay border area itself,
      // not clicks that pass through to table cells.
      // The click area is the thin border region around the table.
      e.stopPropagation();
      editor.update(() => {
        const currentNode = $getNodeByKey(nodeKey);
        if (currentNode) {
          const selection = $createNodeSelection();
          selection.add(nodeKey);
          $setSelection(selection);
        }
      });
    },
    [editor, nodeKey]
  );

  // Click-outside detection to deselect
  useEffect(() => {
    if (!isSelected) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is outside the table's DOM area
      // Find the table element via the editor
      const tableElement = editor.getElementByKey(nodeKey);
      if (!tableElement) return;

      // If the click is inside the table element or the overlay, don't deselect
      if (
        tableElement.contains(target) ||
        overlayRef.current?.contains(target)
      ) {
        return;
      }

      // Deselect the table
      editor.update(() => {
        const selection = $getSelection();
        if ($isNodeSelection(selection) && selection.has(nodeKey)) {
          $setSelection(null);
        }
      });
    };

    // Use setTimeout to avoid catching the same click that selected the node
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelected, editor, nodeKey, overlayRef]);

  return { isSelected, handleClick };
}
