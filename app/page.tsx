'use client'
import Image from "next/image";
import Editor from "./components/editor/Editor";
import Toolbar from "./components/toolbar/Toolbar";
import { ThemeProvider } from "@huzaifah191001/design-library";

export default function Home() {
  return (
    <ThemeProvider>
      <div className="flex flex-col flex-1 font-sans bg-(--background)">
        <Editor />
      </div>
    </ThemeProvider>
  );
}
