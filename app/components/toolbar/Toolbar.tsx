"use client";
import React from "react";
// import { Button } from "../button/Button";
import { Button } from "@huzaifah191001/design-library";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND } from "lexical";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="max-h-10 flex flex-row flex-1 gap-2 items-center pl-2 border border-(--muted-foreground) rounded-sm bg-(--primary-foreground)">
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        children={<span>bold</span>}
      />
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        children={<span>italic</span>}
      />
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        children={<span>underline</span>}
      />
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        children={<span>strikethrough</span>}
      />
    </div>
  );
};

export default Toolbar;
