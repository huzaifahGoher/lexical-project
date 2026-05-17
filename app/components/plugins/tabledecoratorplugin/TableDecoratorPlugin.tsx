"use client";
import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, $nodesOfType, NodeMutation } from "lexical";
import { CustomTableNode } from "@/app/customnodes/tablenode/tableNode";
import { TableNodeDecorator } from "@/app/customnodes/tablenode/TableNodeDecorator";

interface TablePortalEntry {
  nodeKey: string;
  element: HTMLElement;
  width: number | null;
  height: number | null;
}

/**
 * TableDecoratorPlugin renders interactive overlays (selection border, resize
 * handle, insertion buttons) for each CustomTableNode in the editor.
 *
 * Strategy: Portal the decorator into the editor's root element (the content
 * editable container). The decorator overlay positions itself absolutely
 * relative to the editor root, using the table element's offset position.
 */
const TableDecoratorPlugin = (): React.JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  const [tablePortals, setTablePortals] = useState<TablePortalEntry[]>([]);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  // Track the editor's root element
  useEffect(() => {
    setRootElement(editor.getRootElement());
    return editor.registerRootListener((newRoot: HTMLElement | null) => {
      setRootElement(newRoot);
    });
  }, [editor]);

  // Scan all existing table nodes and build portal entries
  const scanExistingTables = useCallback(() => {
    editor.getEditorState().read(() => {
      const tableNodes = $nodesOfType(CustomTableNode);
      const portals: TablePortalEntry[] = [];

      for (const node of tableNodes) {
        const nodeKey = node.getKey();
        const element = editor.getElementByKey(nodeKey);
        if (element) {
          portals.push({
            nodeKey,
            element,
            width: node.getWidth(),
            height: node.getHeight(),
          });
        }
      }

      if (portals.length > 0) {
        setTablePortals(portals);
      }
    });
  }, [editor]);

  useEffect(() => {
    // Initial scan for tables that already exist in the editor
    // Use a small delay to ensure DOM is reconciled after hydration
    const timeoutId = setTimeout(scanExistingTables, 100);

    // Listen for future mutations (new tables added, existing ones updated/removed)
    const removeMutationListener = editor.registerMutationListener(
      CustomTableNode,
      (mutations: Map<string, NodeMutation>) => {
        editor.getEditorState().read(() => {
          const updatedPortals: TablePortalEntry[] = [];

          mutations.forEach((mutation, nodeKey) => {
            if (mutation === "destroyed") {
              return;
            }

            const element = editor.getElementByKey(nodeKey);
            const node = $getNodeByKey(nodeKey) as CustomTableNode | null;

            if (element && node) {
              updatedPortals.push({
                nodeKey,
                element,
                width: node.getWidth(),
                height: node.getHeight(),
              });
            }
          });

          setTablePortals((prev) => {
            const destroyedKeys = new Set<string>();
            mutations.forEach((mutation, nodeKey) => {
              if (mutation === "destroyed") {
                destroyedKeys.add(nodeKey);
              }
            });

            const remaining = prev.filter(
              (portal) => !destroyedKeys.has(portal.nodeKey)
            );

            for (const updated of updatedPortals) {
              const existingIndex = remaining.findIndex(
                (p) => p.nodeKey === updated.nodeKey
              );
              if (existingIndex >= 0) {
                remaining[existingIndex] = updated;
              } else {
                remaining.push(updated);
              }
            }

            return remaining;
          });
        });
      }
    );

    // Also listen for editor state changes to catch tables loaded from storage
    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState, dirtyElements }) => {
        if (dirtyElements.size === 0) return;

        editorState.read(() => {
          const tableNodes = $nodesOfType(CustomTableNode);
          const portals: TablePortalEntry[] = [];

          for (const node of tableNodes) {
            const nodeKey = node.getKey();
            const element = editor.getElementByKey(nodeKey);
            if (element) {
              portals.push({
                nodeKey,
                element,
                width: node.getWidth(),
                height: node.getHeight(),
              });
            }
          }

          setTablePortals(portals);
        });
      }
    );

    return () => {
      clearTimeout(timeoutId);
      removeMutationListener();
      removeUpdateListener();
    };
  }, [editor, scanExistingTables]);

  // Ensure the root element is positioned so absolute children work correctly
  if (!rootElement) return null;

  return (
    <>
      {tablePortals.map((portal) =>
        createPortal(
          <TableNodeDecorator
            key={portal.nodeKey}
            nodeKey={portal.nodeKey}
            width={portal.width}
            height={portal.height}
            editor={editor}
          />,
          document.body
        )
      )}
    </>
  );
};

export default TableDecoratorPlugin;
