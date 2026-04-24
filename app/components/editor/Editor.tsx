"use client";
import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState, LexicalEditor, ParagraphNode, TextNode } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import Toolbar from "../toolbar/Toolbar";
import "./editorTheme.css"
import { exampleTheme } from "./theme";
import { CheckListExtension, ListItemNode, ListNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";

const config = {
  namespace: "lexical",
  theme: exampleTheme,
  nodes: [TextNode, ParagraphNode, ListNode, ListItemNode],
  onError: console.error,
};

const Editor = () => {
  const onChange = (editorState: EditorState, editor: LexicalEditor) => {
    console.log(editorState.toJSON());
  };

  return (
    <div className="editor-container w-full bg-(--background) text-(--foreground)">
      <LexicalComposer initialConfig={config}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="flex-1 outline-none"
              aria-placeholder={"Enter some text..."}
              placeholder={<div className="text-gray-400 mt-10">write text here</div>}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <TabIndentationPlugin />
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
};

export default Editor;
