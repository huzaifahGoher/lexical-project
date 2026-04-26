"use client";
import React, { SyntheticEvent, useEffect, useState } from "react";
// import { Button } from "../button/Button";
import { Button } from "@huzaifah191001/design-library";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  $insertList,
  INSERT_CHECK_LIST_COMMAND,
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

const undoRedoOptions = [
  { label: "undo", command: UNDO_COMMAND },
  { label: "redo", command: REDO_COMMAND },
];

const keysMap = new Map([
  ["l", { value: "left", command: FORMAT_ELEMENT_COMMAND }],
  ["e", { value: "center", command: FORMAT_ELEMENT_COMMAND }],
  ["r", { value: "right", command: FORMAT_ELEMENT_COMMAND }],
  ["j", { value: "justify", command: FORMAT_ELEMENT_COMMAND }],
  ["z", { value: undefined, command: UNDO_COMMAND }],
  ["y", { value: undefined, command: REDO_COMMAND }],
]);

type alignmentType = "left" | "right" | "center" | "justify";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [showMenu, setShowMenu] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (!event.ctrlKey) {
        if (event.key === "/") {
          setShowMenu(true);
        } else if (event.key === "Escape") {
          setShowMenu(false);
        }
        return;
      }
      const config = keysMap.get(event.key.toLowerCase());
      if (!config) return;
      const { value, command } = config;
      if (!value) return;
      event.preventDefault();
      editor.dispatchCommand(command, (value as alignmentType) || undefined);
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
        <option value="normal">normal</option>
        <option value="quote">quote</option>
        <option value="h1">heading 1</option>
        <option value="h2">heading 2</option>
        <option value="h3">heading 3</option>
        <option value="h4">heading 4</option>
        <option value="h5">heading 5</option>
        <option value="h6">heading 6</option>
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
