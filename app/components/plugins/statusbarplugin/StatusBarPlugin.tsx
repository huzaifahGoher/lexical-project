import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { RootState } from "@/lib/store";
import { useTheme } from "@huzaifah191001/design-library";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, EditorState } from "lexical";
import Image from "next/image";
import React, { useState } from "react";

const StatusBarPlugin = () => {
  const dispatch = useAppDispatch();
  const themeStyles = useTheme();
  const theme = useAppSelector((state: RootState) => state.themeObject.theme);
  const [data, setData] = useState({
    wordCount: 0,
    readingTime: 0,
    characterCount: 0,
  });

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      const characterCount = root.getTextContentSize();
      const wordCount = text.split(" ").length || 0;
      const readingTime = wordCount * 0.375;

      setData({ wordCount, readingTime, characterCount });
    });
  };

  return (
    <div
      style={{
        backgroundColor: themeStyles.colors.bg,
        width: "200px",
        height: "200px",
        borderRadius: "5px",
        border: `1px solid ${themeStyles.colors.border}`,
        position: "fixed",
        bottom: "10px",
        right: "10px",
        boxShadow: `${theme === "dark" ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)"} 0px 5px 20px`,
        padding: "5px",
        display: "flex",
        flexFlow: "row wrap",
        gap: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>{theme} Theme: </span>
        <Image
          style={{ cursor: "pointer" }}
          onClick={() => {
            dispatch({
              type: "theme/setTheme",
              payload: `${theme === "light" ? "dark" : "light"}`,
            });
          }}
          width={15}
          height={15}
          alt=""
          src={theme === "dark" ? "./light-theme.svg" : "./dark-theme.svg"}
        />
      </div>
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
