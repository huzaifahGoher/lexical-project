import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, EditorState } from "lexical";
import React, { useState } from "react";

const StatusBarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [data, setData] = useState({wordCount: 0, readingTime: 0, characterCount: 0})

  const handleChange = (editorState: EditorState) => {
    editorState.read(()=>{
        const root = $getRoot();
        const text = root.getTextContent();
        const characterCount = root.getTextContentSize();
        const wordCount = text.split(' ').length || 0;
        const readingTime = wordCount*0.375;

        setData({wordCount, readingTime, characterCount});
    })
  };

  return (
    <div
      style={{
        backgroundColor: "grey",
        width: "200px",
        height: "100px",
        borderRadius: "5px",
        position: "fixed",
        bottom: "10px",
        right: "5px",
        padding: "5px",
        display: "flex",
        flexFlow: "row wrap",
        gap: "4px"
      }}
    >
        <span>Word Count: </span>
        <span>{data.wordCount}</span>
        <span>Character Count: </span>
        <span>{data.characterCount}</span>
        <span>Reading Time: </span>
        <span>{data.readingTime}</span>
      <OnChangePlugin onChange={handleChange} />
    </div>
  );
};

export default StatusBarPlugin;
