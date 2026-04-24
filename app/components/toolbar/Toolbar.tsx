"use client";
import React from "react";
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
  }
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

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
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
