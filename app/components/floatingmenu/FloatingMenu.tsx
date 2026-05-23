import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { handleHeading } from "../toolbar/utils/toolbarUtils";
import { globalConstants } from "@/app/constants/global/globalConstants";
import {
  $insertList,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $createImageNode } from "@/app/customnodes/utils/customNodeUtils";
import {
  $insertNodes,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  TextFormatType,
} from "lexical";
import { formattingOptions } from "../toolbar/constants/toolbarConstant";
import { $createTableNode, INSERT_TABLE_COMMAND } from "@lexical/table";
import Image from "next/image";
import { onUploadImage } from "@/app/utils/uploadImage";

// ─── Type Definitions ─────────────────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  iconType: "text" | "img";
  keywords: string[];
  type?: string;
  value?: string;
  isAI?: boolean;
}

interface CommandGroup {
  group: string;
  items: CommandItem[];
}

interface Position {
  top: number;
  left: number;
}

interface FloatingMenuProps {
  position?: Position;
  onSelect?: (commandId: string) => void;
  onClose?: () => void;
}

interface CommandItemWithGroup extends CommandItem {
  group: string;
}

// ─── Command Definitions ──────────────────────────────────────────────────────

const COMMANDS: CommandGroup[] = [
  {
    group: "Basic Blocks",
    items: [
      {
        id: "heading1",
        label: "Heading 1",
        description: "Large section heading",
        icon: "H1",
        type: "block",
        value: globalConstants.BLOCK.VALUES.H1,
        iconType: "text",
        keywords: ["h1", "heading", "title", "large"],
      },
      {
        id: "heading2",
        label: "Heading 2",
        description: "Medium section heading",
        icon: "H2",
        type: "block",
        value: globalConstants.BLOCK.VALUES.H2,
        iconType: "text",
        keywords: ["h2", "heading", "subtitle", "medium"],
      },
      {
        id: "heading3",
        label: "Heading 3",
        description: "Small section heading",
        icon: "H3",
        type: "block",
        value: globalConstants.BLOCK.VALUES.H3,
        iconType: "text",
        keywords: ["h3", "heading", "small"],
      },
      {
        id: "paragraph",
        label: "Paragraph",
        description: "Plain text block",
        icon: "¶",
        type: "block",
        value: globalConstants.BLOCK.VALUES.NORMAL,
        iconType: "text",
        keywords: ["text", "paragraph", "plain", "body"],
      },
      {
        id: "blockquote",
        label: "Blockquote",
        description: "Highlight a quote or callout",
        icon: "/menu/blockquote.svg",
        type: "block",
        value: globalConstants.BLOCK.VALUES.QUOTE,
        iconType: "img",
        keywords: ["quote", "blockquote", "callout"],
      },
    ],
  },
  {
    group: "Lists",
    items: [
      {
        id: "bullet-list",
        label: "Bullet List",
        description: "Simple unordered list",
        icon: "/menu/bullet-list.svg",
        type: "list",
        value: "bullet",
        iconType: "img",
        keywords: ["bullet", "list", "unordered", "ul"],
      },
      {
        id: "numbered-list",
        label: "Numbered List",
        description: "Ordered list with numbers",
        icon: "/menu/numbered-list.svg",
        type: "list",
        value: "number",
        iconType: "img",
        keywords: ["numbered", "list", "ordered", "ol"],
      },
    ],
  },
  {
    group: "Media & Content",
    items: [
      {
        id: "image",
        label: "Image",
        description: "Embed an image from URL or upload",
        icon: "/menu/image.svg",
        iconType: "img",
        keywords: ["image", "photo", "picture", "img", "embed"],
      },
      {
        id: "code",
        label: "Code Block",
        type: "text",
        value: "code",
        description: "Syntax-highlighted code snippet",
        icon: "/menu/code-block.svg",
        iconType: "img",
        keywords: ["code", "snippet", "block", "pre", "syntax"],
      },
      {
        id: "table",
        label: "Table",
        type: "table",
        description: "Insert a structured data table",
        icon: "/menu/table.svg",
        iconType: "img",
        keywords: ["table", "grid", "rows", "columns", "data"],
      },
    ],
  },
];

// Flatten all items for search
const ALL_ITEMS: CommandItemWithGroup[] = COMMANDS.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.group }))
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FloatingMenu({
  // In your real Lexical integration, pass these props:
  // position: { top, left } — computed from editor cursor position
  // onSelect: (commandId) => void — called when user picks a command
  // onClose: () => void — called when menu should close
  position = { top: 120, left: 80 },
  onSelect,
  onClose,
}: FloatingMenuProps) {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter commands based on query
  const filtered: CommandItemWithGroup[] | null = query.trim()
    ? ALL_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : null; // null means show all grouped

  // Grouped result for display
  const groupedResults: CommandGroup[] = filtered
    ? [{ group: "Results", items: filtered }]
    : COMMANDS;

  const flatResults: CommandItemWithGroup[] = filtered ?? ALL_ITEMS;

  // Keep activeIndex in bounds
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = flatResults[activeIndex];
        if (selected) handleSelect(selected);
      } else if (e.key === "Escape") {
        onClose?.();
      }
    },
    [activeIndex, flatResults, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Focus input on mount (delayed to avoid capturing the triggering "/" keystroke)
  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  // Scroll active item into view
  useEffect(() => {
    const el = menuRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = (item: any) => {
    const closeEditor = () => {
      onSelect?.(item.id);
      onClose?.();
    };
    if (item.id === "image") {
      const inputElement = document.getElementById("upload-image");
      if (!inputElement) return;
      inputElement.click();
      return;
    }

    if (!item.type) {
      closeEditor();
      return;
    }
    if (item.type === "block") {
      handleHeading(editor, item.value);
    } else if (item.type === "list") {
      const command =
        item.value === "number"
          ? INSERT_ORDERED_LIST_COMMAND
          : INSERT_UNORDERED_LIST_COMMAND;
      editor.dispatchCommand(command, undefined);
    } else if (item.type === "text") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, item.value as TextFormatType);
    } else if (item.type === "table") {
      editor.update(()=>{
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {rows: String(5), columns: String(5)});
      })
    }
    closeEditor();
  };

  let flatIdx = 0; // track global index across groups

  return (
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      className="fixed z-50 w-72 rounded-xl border border-neutral-200 bg-white shadow-2xl shadow-black/10 overflow-hidden"
    >
      {/* Search input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100">
        <Image
          src="/menu/search.svg"
          alt="Search"
          width={14}
          height={14}
          className="text-neutral-400 shrink-0"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commands..."
          className="flex-1 text-sm bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <Image
              src="/menu/close.svg"
              alt="Clear"
              width={14}
              height={14}
            />
          </button>
        )}
      </div>

      {/* Command list */}
      <div className="max-h-72 overflow-y-auto py-1">
        {groupedResults.length === 0 || (filtered && filtered.length === 0) ? (
          <div className="px-4 py-6 text-center text-sm text-neutral-400">
            No commands found for &quot;{query}&quot;
          </div>
        ) : (
          groupedResults.map((group) => {
            const groupItems = group.items;
            if (groupItems.length === 0) return null;

            return (
              <div key={group.group}>
                {/* Group label */}
                {(!filtered || groupedResults.length > 1) && (
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
                    {group.group}
                  </p>
                )}

                {groupItems.map((item) => {
                  const currentIdx = flatIdx++;
                  const isActive = activeIndex === currentIdx;

                  return (
                    <div key={item.id}>
                      {item.id === "image" && (
                        <input
                          id="upload-image"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e)=>{
                            onUploadImage(e, editor);
                            onClose?.();
                          }}
                        />
                      )}
                      <button
                        data-active={isActive}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(currentIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                          isActive ? "bg-neutral-100" : "hover:bg-neutral-50"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
                            item.isAI
                              ? "bg-violet-100 text-violet-600"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {item.iconType === "text" ? item.icon : (
                            <Image src={item.icon} alt={item.label} width={16} height={16} />
                          )}
                        </div>

                        {/* Label + description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-neutral-800 truncate">
                              {item.label}
                            </span>
                            {item.isAI && (
                              <span className="text-[9px] font-semibold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full tracking-wide">
                                AI
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 truncate">
                            {item.description}
                          </p>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <Image
                            src="/menu/chevron-right.svg"
                            alt="Selected"
                            width={14}
                            height={14}
                            className="text-neutral-400 shrink-0"
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-neutral-100 flex items-center gap-3 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px]">
            ↑↓
          </kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px]">
            ↵
          </kbd>
          select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px]">
            Esc
          </kbd>
          close
        </span>
      </div>
    </div>
  );
}
