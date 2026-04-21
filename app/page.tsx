import Image from "next/image";
import Editor from "./components/editor/Editor";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <Editor />
    </div>
  );
}
