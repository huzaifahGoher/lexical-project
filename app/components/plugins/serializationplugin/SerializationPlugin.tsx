import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const SerializationPlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const data = sessionStorage.getItem("data");
    if (!data) return;
    const editorstate = editor.parseEditorState(data);
    if (!editorstate) return;
    editor.update(()=>{
        editor.setEditorState(editorstate);
    })
  }, []);
  return null;
};

export default SerializationPlugin;
