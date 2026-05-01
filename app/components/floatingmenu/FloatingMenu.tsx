import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { ReactNode } from "react";
import { handleHeading } from "../toolbar/utils/toolbarUtils";
import { globalConstants } from "@/app/constants/global/globalConstants";

// ─── Type Definitions ─────────────────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: string | ReactNode;
  iconType: "text" | "svg";
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
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6 4a1 1 0 00-1 1v4a1 1 0 001 1h2.5l-1 2H6a1 1 0 000 2h2a1 1 0 00.894-.553l2-4A1 1 0 0010 8V5a1 1 0 00-1-1H6zm8 0a1 1 0 00-1 1v4a1 1 0 001 1h2.5l-1 2H14a1 1 0 000 2h2a1 1 0 00.894-.553l2-4A1 1 0 0018 8V5a1 1 0 00-1-1h-3z" />
          </svg>
        ),
        type: "block",
        value: globalConstants.BLOCK.VALUES.QUOTE,
        iconType: "svg",
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
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 5a1 1 0 100 2 1 1 0 000-2zm3 1a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1zm-3 5a1 1 0 100 2 1 1 0 000-2zm3 1a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1zm-3 5a1 1 0 100 2 1 1 0 000-2zm3 1a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        type: "list",
        value: "number",
        iconType: "svg",
        keywords: ["bullet", "list", "unordered", "ul"],
      },
      {
        id: "numbered-list",
        label: "Numbered List",
        description: "Ordered list with numbers",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4 4a1 1 0 000 2h.01a1 1 0 000-2H4zm3 1a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm-3 5a1 1 0 100 2h.01a1 1 0 100-2H4zm3 1a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm-3 5a1 1 0 100 2h.01a1 1 0 100-2H4zm3 1a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        type: "lists",
        value: "bullet",
        iconType: "svg",
        keywords: ["numbered", "list", "ordered", "ol"],
      }
    ],
  },
  {
    group: "Media & Content",
    items: [
      {
        id: "image",
        label: "Image",
        description: "Embed an image from URL or upload",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        ),
        iconType: "svg",
        keywords: ["image", "photo", "picture", "img", "embed"],
      },
      {
        id: "code",
        label: "Code Block",
        description: "Syntax-highlighted code snippet",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ),
        iconType: "svg",
        keywords: ["code", "snippet", "block", "pre", "syntax"],
      },
      {
        id: "divider",
        label: "Divider",
        description: "Horizontal rule to separate sections",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ),
        iconType: "svg",
        keywords: ["divider", "hr", "rule", "separator", "line"],
      },
      {
        id: "table",
        label: "Table",
        description: "Insert a structured data table",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
        ),
        iconType: "svg",
        keywords: ["table", "grid", "rows", "columns", "data"],
      },
    ],
  },
  {
    group: "AI",
    items: [
      {
        id: "ai-rewrite",
        label: "AI Rewrite",
        description: "Improve selected text with AI",
        icon: "✦",
        iconType: "text",
        keywords: ["ai", "rewrite", "improve", "gpt", "claude", "generate"],
        isAI: true,
      },
      {
        id: "ai-summarize",
        label: "AI Summarize",
        description: "Summarize selected content",
        icon: "✦",
        iconType: "text",
        keywords: ["ai", "summarize", "summary", "shorten"],
        isAI: true,
      },
    ],
  },
];

// Flatten all items for search
const ALL_ITEMS: CommandItemWithGroup[] = COMMANDS.flatMap((g) => g.items.map((item) => ({ ...item, group: g.group })));

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

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll active item into view
  useEffect(() => {
    const el = menuRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = (item: any) => {
    onSelect?.(item.id);
    onClose?.();

    if(!item.type) return;

    if(item.type === "block"){
      handleHeading(editor, item.value);
    }
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
        <svg
          className="w-3.5 h-3.5 text-neutral-400 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
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
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
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
                    <button
                      key={item.id}
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
                        {item.iconType === "text" ? item.icon : item.icon}
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
                        <p className="text-xs text-neutral-400 truncate">{item.description}</p>
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <svg
                          className="w-3.5 h-3.5 text-neutral-400 shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
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
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px]">↑↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px]">↵</kbd>
          select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[10px]">Esc</kbd>
          close
        </span>
      </div>
    </div>
  );
}