"use client";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Button, Select, useTheme } from "@huzaifah191001/design-library";
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
} from "./constants/toolbarConstant";
import {
  exportMarkDown,
  getCarretPosition,
  handleHeading,
} from "./utils/toolbarUtils";
import Image from "next/image";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const { showMenu, setShowMenu } = useKeyDownHandler();

  return (
    <div className="p-7 max-h-10 flex flex-row flex-1 gap-2 items-center pl-2 border border-(--muted-foreground) rounded-sm ">
      {formattingOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, item.dispatchValue);
          }}
          title={item.label}
        >
          <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
        </Button>
      ))}
      {alignmentOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, item.dispatchValue);
          }}
          title={item.label}
        >
          <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
        </Button>
      ))}
      {listOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(item.dispatchCommand, undefined);
          }}
          title={item.label}
        >
          <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
        </Button>
      ))}
      {undoRedoOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(item.command, undefined);
          }}
          title={item.label}
        >
          <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
        </Button>
      ))}
      <Button onClick={() => exportMarkDown(editor)}>Export markdown</Button>
      <Select
        onChange={(value) => {
          handleHeading(editor, value);
        }}
        options={blockOptions}
        defaultValue={blockOptions[0]}
      />
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
