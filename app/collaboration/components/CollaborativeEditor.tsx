'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ParagraphNode, TextNode } from 'lexical';
import { ListItemNode, ListNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { HorizontalRuleNode } from '@lexical/extension';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import { LexicalCollaboration } from '@lexical/react/LexicalCollaborationContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { Provider } from '@lexical/yjs';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import type * as Y from 'yjs';

import 'prismjs/themes/prism.css';

import { exampleTheme } from '@/app/components/editor/theme';
import Toolbar from '@/app/components/toolbar/Toolbar';
import CodePlugin from '@/app/components/plugins/codeplugin/CodePlugin';
import { ImageNode } from '@/app/customnodes/imagenode/imageNode';
import ImagePlugin from '@/app/components/plugins/imageplugin/ImagePlugin';
import StatusBarPlugin from '@/app/components/plugins/statusbarplugin/StatusBarPlugin';
import TableDecoratorPlugin from '@/app/components/plugins/tabledecoratorplugin/TableDecoratorPlugin';
import HoverCardPlugin from '@/app/components/plugins/hovercardplugin/HoverCardPlugin';
import { CustomLinkNode } from '@/app/customnodes/linknode/linkNode';
import {
  CustomTableCellNode,
  CustomTableNode,
  CustomTableRowNode,
} from '@/app/customnodes/tablenode/tableNode';
import {
  $createCustomTableCellNode,
  $createCustomTableNode,
  $createCustomTableRowNode,
} from '@/app/customnodes/utils/customNodeUtils';

import { useCollaboration } from './CollaborationProvider';

/**
 * Static initial config — defined outside the component so it never changes.
 */
const initialConfig = {
  namespace: 'lexical-collaborative',
  theme: exampleTheme,
  editable: true,
  editorState: null,
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
      with: (_node: TableNode) => {
        return $createCustomTableNode();
      },
      withKlass: CustomTableNode,
    },
    CustomTableNode,
    {
      replace: TableCellNode,
      with: (_node: TableCellNode) => {
        return $createCustomTableCellNode();
      },
      withKlass: CustomTableCellNode,
    },
    CustomTableCellNode,
    {
      replace: TableRowNode,
      with: (_node: TableRowNode) => {
        return $createCustomTableRowNode();
      },
      withKlass: CustomTableRowNode,
    },
    CustomTableRowNode,
  ],
  onError: console.error,
};

interface CollaborativeEditorProps {
  userName: string;
  userColor: string;
  isObserver: boolean;
}

/**
 * Plugin that sets the editor to read-only mode for observers.
 */
function ReadOnlyPlugin({ isObserver }: { isObserver: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(!isObserver);
  }, [editor, isObserver]);
  return null;
}

/**
 * CollaborativeEditor renders the same Lexical editor as the home page
 * but with CollaborationPlugin instead of HistoryPlugin.
 *
 * IMPORTANT: Props (userName, userColor, isObserver) are passed directly
 * rather than read from context to avoid re-render loops. The context
 * values change when awareness updates, which would cause infinite re-mounts.
 */
export default function CollaborativeEditor({ userName, userColor, isObserver }: CollaborativeEditorProps) {
  const { providerFactory } = useCollaboration();

  // Stable wrapper — providerFactory already has a stable reference from the hook
  const collaborationProviderFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>): Provider => {
      return providerFactory(id, yjsDocMap) as unknown as Provider;
    },
    [providerFactory]
  );

  // Memoize awarenessData so it doesn't cause re-renders
  const awarenessData = useMemo(() => ({ isObserver }), [isObserver]);

  return (
    <div className="editor-container w-full">
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalCollaboration>
          {!isObserver && <Toolbar />}
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="flex-1 outline-none"
                aria-placeholder="Enter some text..."
                placeholder={
                  <div className="text-gray-400 mt-15">write text here</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <StatusBarPlugin />
          <TabIndentationPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <CodePlugin />
          <ImagePlugin />
          <HoverCardPlugin />
          <TablePlugin />
          <TableDecoratorPlugin />
          <ReadOnlyPlugin isObserver={isObserver} />
          <CollaborationPlugin
            id="main"
            providerFactory={collaborationProviderFactory}
            shouldBootstrap={false}
            username={userName}
            cursorColor={userColor}
            awarenessData={awarenessData}
          />
        </LexicalCollaboration>
      </LexicalComposer>
    </div>
  );
}
