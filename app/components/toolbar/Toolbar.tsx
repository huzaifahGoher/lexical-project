"use client";
import React from "react";
import { Button } from "@huzaifah191001/design-library";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND } from "lexical";
import FloatingMenu from "../floatingmenu/FloatingMenu";
import useKeyDownHandler from "./hooks/useKeyDownHandler";
import {
  formattingOptions,
  alignmentOptions,
  listOptions,
  undoRedoOptions,
  blockOptions,
} from "./constants/ToolbarConstant";
import {
  exportMarkDown,
  getCarretPosition,
  handleHeading,
} from "./utils/ToolbarUtils";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const { showMenu, setShowMenu } = useKeyDownHandler();

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
      <Button onClick={() => exportMarkDown(editor)}>Export markdown</Button>
      <select
        onChange={(event) => {
          handleHeading(editor, event.target.value);
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
          position={getCarretPosition(showMenu)}
          onSelect={() => {
            setShowMenu(false);
            editor.focus();
          }}
          onClose={() => {
            setShowMenu(false);
            editor.focus();
          }}
        />
      )}
    </div>
  );
};

export default Toolbar;
