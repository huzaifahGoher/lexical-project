import React, { JSX, useState, useRef, useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import "./ImageNodeDecorator.css";
import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { ImageNode } from "./imageNode";

type ImageNodeDecoratorProps = {
  nodeKey: string;
  src: string;
  width: number;
  height: number;
};

export function ImageNodeDecorator({
  nodeKey,
  src,
  width,
  height,
}: ImageNodeDecoratorProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: width || 200,
    height: height || 150,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const currentDimensions = useRef(dimensions);
  const aspectRatio = useRef(dimensions.width / dimensions.height);

  // Update ref whenever dimensions change
  useEffect(() => {
    currentDimensions.current = dimensions;
  }, [dimensions]);

  useEffect(() => {
    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const currentNode = $getNodeByKey(nodeKey);
          const selection = $getSelection();
          if (currentNode && selection) {
            const isNodeSelected = currentNode.isSelected(selection);
            setIsSelected(isNodeSelected);
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

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
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

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const startPos = { x: event.clientX, y: event.clientY };
    const handleMouseMove = (event: MouseEvent) => {
      console.log("mouse move", event);
      const delta = {
        x: startPos.x - event.clientX,
        y: startPos.y - event.clientY,
      };
      setDimensions({
        width: dimensions.width - delta.x,
        height: dimensions.height - delta.y,
      });
    };

    const cleanUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseUp = (event: MouseEvent) => {
      console.log("mouse up", event);
      cleanUp();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className={`image-container ${isSelected ? "selected" : ""}`}
      style={{ width: dimensions.width, height: dimensions.height }}
      onClick={handleClick}
      tabIndex={0}
    >
      <img
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        draggable={false}
      />

      {isSelected && (
        <>
          <div
            className="resize-handle se"
            onMouseDown={(e) => {
              handleMouseDown(e);
            }}
            tabIndex={0}
            role="button"
            aria-label="Resize from bottom-right corner"
          />
        </>
      )}
    </div>
  );
}
