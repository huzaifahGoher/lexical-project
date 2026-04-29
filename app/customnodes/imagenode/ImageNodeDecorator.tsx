import React, { JSX, useState, useRef, useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { SerializedImageNodeType } from "../types/customNodeTypes";
import "./ImageNodeDecorator.css";
import {
  $getNodeByKey,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

type ImageNodeDecoratorProps = {
  node: SerializedImageNodeType;
  nodeKey: string;
};

export function ImageNodeDecorator({
  node,
  nodeKey,
}: ImageNodeDecoratorProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 200, height: 150 });
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const node = $getNodeByKey(nodeKey);
        if (node && node.isSelected()) {
          setIsSelected(true);
        } else if (node && !node.isSelected()) {
          setIsSelected(false);
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, []);

  const handleMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;

      switch (corner) {
        case "se": // bottom-right
          newWidth = Math.max(50, startPos.current.width + deltaX);
          newHeight = Math.max(50, startPos.current.height + deltaY);
          break;
        case "sw": // bottom-left
          newWidth = Math.max(50, startPos.current.width - deltaX);
          newHeight = Math.max(50, startPos.current.height + deltaY);
          break;
        case "ne": // top-right
          newWidth = Math.max(50, startPos.current.width + deltaX);
          newHeight = Math.max(50, startPos.current.height - deltaY);
          break;
        case "nw": // top-left
          newWidth = Math.max(50, startPos.current.width - deltaX);
          newHeight = Math.max(50, startPos.current.height - deltaY);
          break;
      }

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className={`image-container ${isSelected ? "selected" : ""}`}
      style={{ width: dimensions.width, height: dimensions.height }}
      onClick={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
    >
      <img
        src={node.src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        draggable={false}
      />

      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div
            className="resize-handle nw"
            onMouseDown={(e) => handleMouseDown(e, "nw")}
          />
          <div
            className="resize-handle ne"
            onMouseDown={(e) => handleMouseDown(e, "ne")}
          />
          <div
            className="resize-handle sw"
            onMouseDown={(e) => handleMouseDown(e, "sw")}
          />
          <div
            className="resize-handle se"
            onMouseDown={(e) => handleMouseDown(e, "se")}
          />
        </>
      )}
    </div>
  );
}
