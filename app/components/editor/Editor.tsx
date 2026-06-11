"use client";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  EditorState, LexicalEditor,
  ParagraphNode,
  TextNode,
} from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import Toolbar from "../toolbar/Toolbar";
import "./editorTheme.css";
import { exampleTheme } from "./theme";
import { ListItemNode, ListNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/extension";
import "prismjs/themes/prism.css";
import CodePlugin from "../plugins/codeplugin/CodePlugin";
import { ImageNode } from "@/app/customnodes/imagenode/imageNode";
import ImagePlugin from "../plugins/imageplugin/ImagePlugin";
import SerializationPlugin from "../plugins/serializationplugin/SerializationPlugin";
import StatusBarPlugin from "../plugins/statusbarplugin/StatusBarPlugin";
import TableDecoratorPlugin from "../plugins/tabledecoratorplugin/TableDecoratorPlugin";
import HoverCardPlugin from "../plugins/hovercardplugin/HoverCardPlugin";
import { CustomLinkNode } from "@/app/customnodes/linknode/linkNode";
import { debounce } from "lodash";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { CustomTableCellNode, CustomTableNode, CustomTableRowNode } from "@/app/customnodes/tablenode/tableNode";
import { $createCustomTableCellNode, $createCustomTableNode, $createCustomTableRowNode } from "@/app/customnodes/utils/customNodeUtils";

const config = {
  namespace: "lexical",
  theme: exampleTheme,
  nodes: [
    TextNode,
    ParagraphNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    HeadingNode,
    QuoteNode,
    LinkNode,
    HorizontalRuleNode,
    ImageNode,
    CustomLinkNode,
    {
      replace: TableNode,
      with: (node: TableNode) => {
        return $createCustomTableNode();
      },
      withKlass: CustomTableNode,
    },
    CustomTableNode,
    {
      replace: TableCellNode,
      with: (node: TableCellNode) => {
        return $createCustomTableCellNode();
      },
      withKlass: CustomTableCellNode,
    },
    CustomTableCellNode,
    {
      replace: TableRowNode,
      with: (node: TableRowNode) => {
        return $createCustomTableRowNode();
      },
      withKlass: CustomTableRowNode,
    },
    CustomTableRowNode,
  ],
  onError: console.error,
};

const onChange = debounce((editorState: EditorState, editor: LexicalEditor) => {
  const data = editorState.toJSON();
  sessionStorage.setItem("data", JSON.stringify(data));
}, 200);

const Editor = () => {
  return (
    <div className="editor-container w-full">
      <LexicalComposer initialConfig={config}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="flex-1 outline-none"
              aria-placeholder={"Enter some text..."}
              placeholder={
                <div className="text-gray-400 mt-15">write text here</div>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <SerializationPlugin />
        <StatusBarPlugin />
        <TabIndentationPlugin />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <CodePlugin />
        <ImagePlugin />
        <HoverCardPlugin />
        <TablePlugin />
        <TableDecoratorPlugin />
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
};

export default Editor;
