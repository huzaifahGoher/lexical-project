"use client";
import React, { useEffect } from "react";
// import { Button } from "../button/Button";
import { Button } from "@huzaifah191001/design-library";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND } from "lexical";

const formattingOptions = [
  {
    dispatchValue: "bold",
    label: "bold",
  },
  {
    dispatchValue: "italic",
    label: "italic",
  },
  {
    dispatchValue: "underline",
    label: "underline",
  },
  {
    dispatchValue: "strikethrough",
    label: "strikethrough",
  },
  {
    dispatchValue: "code",
    label: "code",
  },
];

const alignmentOptions = [
  {
    dispatchValue: "left",
    label: "left",
  },
  {
    dispatchValue: "center",
    label: "center",
  },
  {
    dispatchValue: "right",
    label: "right",
  },
  {
    dispatchValue: "justify",
    label: "justify",
  },
];

const keysMap = new Map([
  ["l", "left"],
  ["e", "center"],
  ["r", "right"],
  ["j", "justify"],
]);

type alignmentType = "left" | "right" | "center" | "justify";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (!event.ctrlKey) return;
      const value = keysMap.get(event.key.toLowerCase());
      if (!value) return;
      event.preventDefault();
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value as alignmentType);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  return (
    <div className="max-h-10 flex flex-row flex-1 gap-2 items-center pl-2 border border-(--muted-foreground) rounded-sm bg-(--primary-foreground)">
      {formattingOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, item.dispatchValue);
          }}
          children={<span>{item.label}</span>}
        />
      ))}
      {alignmentOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, item.dispatchValue);
          }}
          children={<span>{item.label}</span>}
        />
      ))}
    </div>
  );
};

export default Toolbar;
