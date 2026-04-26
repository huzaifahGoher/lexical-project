"use client";
import React from "react";
import { Button } from "@huzaifah191001/design-library";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $convertToMarkdownString } from "@lexical/markdown";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import FloatingMenu from "../floatingmenu/FloatingMenu";
import useKeyDownHandler from "./hooks/useKeyDownHandler";

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

const listOptions = [
  {
    dispatchCommand: INSERT_ORDERED_LIST_COMMAND,
    label: "number list",
  },
  {
    dispatchCommand: INSERT_UNORDERED_LIST_COMMAND,
    label: "bullet list",
  },
];

const blockOptions = [
  { label: "normal", value: "normal" },
  { label: "quote", value: "quote" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
];

const undoRedoOptions = [
  { label: "undo", command: UNDO_COMMAND },
  { label: "redo", command: REDO_COMMAND },
];

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const { showMenu, setShowMenu } = useKeyDownHandler();

  const exportMarkDown = () => {
    editor.update(() => {
      const mdContent = $convertToMarkdownString(undefined, undefined);
      const blob = new Blob([mdContent], { type: "text/markdown" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "document.md";
      link.click();
    });
  };

  const handleHeading = (headingType = "h1") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!selection) return;
      $setBlocksType(selection, () => {
        if (headingType === "normal") return $createParagraphNode();
        if (headingType === "quote") return $createQuoteNode();
        return $createHeadingNode(headingType as HeadingTagType);
      });
    });
  };

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
      {listOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(item.dispatchCommand, undefined);
          }}
          children={<span>{item.label}</span>}
        />
      ))}
      {undoRedoOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(item.command, undefined);
          }}
          children={<span>{item.label}</span>}
        />
      ))}
      <Button onClick={exportMarkDown}>Export markdown</Button>
      <select
        onChange={(event) => {
          handleHeading(event.target.value);
        }}
      >
        {blockOptions.map((item: any, index) => (
          <option
            key={`${index}-${item.label}`}
            label={item.label}
            value={item.value}
          />
        ))}
      </select>

      {showMenu && (
        <FloatingMenu
          onSelect={() => {
            setShowMenu(false);
          }}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default Toolbar;