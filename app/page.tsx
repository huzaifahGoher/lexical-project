'use client'
import Editor from "./components/editor/Editor";
import { ThemeProvider } from "@huzaifah191001/design-library";

export default function Home() {
  return (
    <ThemeProvider themeType="light">
      <div className="flex flex-col flex-1 font-sans bg-(--background)">
        <Editor />
      </div>
    </ThemeProvider>
  );
}
