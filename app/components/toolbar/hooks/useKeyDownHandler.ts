"use client";
import React, { useEffect, useState } from "react";
import {
  COMMAND_PRIORITY_LOW,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  KEY_DOWN_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const keysMap = new Map([
  ["l", { value: "left", command: FORMAT_ELEMENT_COMMAND }],
  ["e", { value: "center", command: FORMAT_ELEMENT_COMMAND }],
  ["r", { value: "right", command: FORMAT_ELEMENT_COMMAND }],
  ["j", { value: "justify", command: FORMAT_ELEMENT_COMMAND }],
]);

const useKeyDownHandler = () => {
  const [editor] = useLexicalComposerContext();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    editor.registerCommand(
      KEY_DOWN_COMMAND,
      (payload: KeyboardEvent) => {
        if (!payload.ctrlKey) {
          if (payload.key === "/") {
            setShowMenu(true);
            return true;
          } else if (payload.key === "Escape") {
            setShowMenu(false);
            return false;
          }
          return false;
        }
        const config = keysMap.get(payload.key.toLowerCase());
        if (!config) return false;
        const { value, command } = config;
        if (!value) return false;
        payload?.preventDefault();
        editor.dispatchCommand(command, value as ElementFormatType);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return { showMenu, setShowMenu };
};

export default useKeyDownHandler;
