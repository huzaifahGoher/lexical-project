"use client";
import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState, LexicalEditor } from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

const config = {
  namespace: "lexical",
  theme: {},
  onError: console.error,
};

const Editor = () => {
  const onChange = (editorState: EditorState, editor: LexicalEditor) => {
    console.log(editorState.toJSON());
  };

  return (
    <div className="editor-container w-full">
      <LexicalComposer initialConfig={config}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="flex-1 outline-none"
              aria-placeholder={"Enter some text..."}
              placeholder={<div className="text-gray-400">write text here</div>}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
};

export default Editor;
