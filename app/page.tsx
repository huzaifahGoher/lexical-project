import Image from "next/image";
import Editor from "./components/editor/Editor";
import Toolbar from "./components/toolbar/Toolbar";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 font-sans bg-(--background)">
      <Editor />
    </div>
  );
}
