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
import { formattingOptions, alignmentOptions, listOptions, undoRedoOptions, blockOptions } from "./constants/ToolbarConstant";
import { globalConstants } from "@/app/constants/global/GlobalConstants";

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

  const handleHeading = (headingType = globalConstants.BLOCK.VALUES.H1) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!selection) return;
      $setBlocksType(selection, () => {
        if (headingType === globalConstants.BLOCK.VALUES.NORMAL) return $createParagraphNode();
        if (headingType === globalConstants.BLOCK.VALUES.QUOTE) return $createQuoteNode();
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