import { globalConstants } from "@/app/constants/global/globalConstants";
import { $convertToMarkdownString } from "@lexical/markdown";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  LexicalEditor,
} from "lexical";

const exportMarkDown = (editor: LexicalEditor) => {
  editor.update(() => {
    const mdContent = $convertToMarkdownString(undefined, undefined);
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.md";
    link.click();
  });
};

const getCarretPosition = (showMenu: boolean) => {
  if (!showMenu) return undefined;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return undefined;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  return { top: rect.top, left: rect.left };
};

const handleHeading = (
  editor: LexicalEditor,
  headingType = globalConstants.BLOCK.VALUES.H1
) => {
  const returnBlockNode = () => {
    if (headingType === globalConstants.BLOCK.VALUES.NORMAL)
      return $createParagraphNode();
    if (headingType === globalConstants.BLOCK.VALUES.QUOTE)
      return $createQuoteNode();
    return $createHeadingNode(headingType as HeadingTagType);
  };

  editor.update(() => {
    const selection = $getSelection();
    if (!selection) {
      const root = $getRoot();
      const nodeToAdd = returnBlockNode();
      root.append(nodeToAdd);
      return;
    }
    $setBlocksType(selection, returnBlockNode);
  });
};

export { handleHeading, getCarretPosition, exportMarkDown };
