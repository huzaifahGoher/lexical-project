import { registerCodeHighlighting } from "@lexical/code-prism";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React, { useEffect } from "react";

const CodePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    registerCodeHighlighting(editor);
  }, []);

  return null;
};

export default CodePlugin;
