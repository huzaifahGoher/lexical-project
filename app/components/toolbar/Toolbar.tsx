"use client";
import { Button, Select, useTheme } from "@huzaifah191001/design-library";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  TextFormatType,
} from "lexical";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import FloatingMenu from "../floatingmenu/FloatingMenu";
import useKeyDownHandler from "./hooks/useKeyDownHandler";
import useOverflowPopover from "./hooks/useOverflowPopover";
import OverflowButton from "./components/OverflowButton";
import OverflowPopover from "./components/OverflowPopover";
import {
  formattingOptions,
  alignmentOptions,
  listOptions,
  undoRedoOptions,
  blockOptions,
} from "./constants/toolbarConstant";
import {
  isPrimaryItem,
  OverflowItem,
  groupOverflowItems,
} from "./utils/overflowUtils";
import {
  exportMarkDown,
  getCarretPosition,
  handleHeading,
} from "./utils/toolbarUtils";
import Image from "next/image";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { onUploadImage } from "@/app/utils/uploadImage";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const { showMenu, setShowMenu } = useKeyDownHandler();
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggle, close, buttonRef, popoverRef } = useOverflowPopover();

  const isCollaborationPage = pathname === "/collaboration";
  const switchHref = isCollaborationPage ? "/" : "/collaboration";
  const switchLabel = isCollaborationPage ? "Solo Editor" : "Collaborate";

  // Partition formatting options into primary and overflow
  const primaryFormattingItems = formattingOptions.filter((item) =>
    isPrimaryItem(item.label),
  );
  const overflowFormattingItems = formattingOptions.filter(
    (item) => !isPrimaryItem(item.label),
  );

  // Build overflow items array with category annotations
  const overflowItems: OverflowItem[] = useMemo(() => {
    const items: OverflowItem[] = [];

    // Overflow formatting items (strikethrough, code)
    for (const item of overflowFormattingItems) {
      items.push({
        label: item.label,
        iconSrc: item.iconSrc,
        category: "formatting",
        action: () => {
          editor.dispatchCommand(
            FORMAT_TEXT_COMMAND,
            item.dispatchValue as TextFormatType,
          );
        },
      });
    }

    // Alignment items
    for (const item of alignmentOptions) {
      items.push({
        label: item.label,
        iconSrc: item.iconSrc,
        category: "alignment",
        action: () => {
          editor.dispatchCommand(
            FORMAT_ELEMENT_COMMAND,
            item.dispatchValue as ElementFormatType,
          );
        },
      });
    }

    // List items
    for (const item of listOptions) {
      items.push({
        label: item.label,
        iconSrc: item.iconSrc,
        category: "lists",
        action: () => {
          editor.dispatchCommand(item.dispatchCommand, undefined);
        },
      });
    }

    // Utilities: Markdown export
    items.push({
      label: "Markdown",
      category: "utilities",
      action: () => {
        exportMarkDown(editor);
      },
    });

    // Utilities: Block Select (handled via handleHeading)
    items.push({
      label: "Block Select",
      category: "utilities",
      action: () => {
        // Block select is a dropdown in desktop; in overflow we default to normal
        handleHeading(editor);
      },
    });

    // Utilities: Collaborate link
    items.push({
      label: switchLabel,
      iconSrc: isCollaborationPage
        ? "/collaboration/solo-user.svg"
        : "/collaboration/collaborate.svg",
      category: "utilities",
      action: () => {
        router.push(switchHref);
      },
    });

    return items;
  }, [
    editor,
    overflowFormattingItems,
    switchLabel,
    isCollaborationPage,
    switchHref,
    router,
  ]);

  // Group overflow items for the popover
  const overflowGroups = useMemo(
    () => groupOverflowItems(overflowItems),
    [overflowItems],
  );

  // Handle action from overflow popover
  const handleOverflowAction = (item: OverflowItem) => {
    item.action();
    close();
  };

  return (
    <div
      className="p-7 max-h-10 flex flex-row flex-1 gap-2 items-center pl-2 rounded-sm relative"
      style={{ border: `1px solid ${theme.colors.borderStrong}` }}
    >
      {/* Primary formatting items — always visible */}
      {primaryFormattingItems.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, item.dispatchValue);
          }}
          title={item.label}
        >
          <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
        </Button>
      ))}

      {/* Undo/Redo — always visible (primary) */}
      {undoRedoOptions.map((item: any, index: number) => (
        <Button
          key={`${index}-${item.label}`}
          onClick={() => {
            editor.dispatchCommand(item.command, undefined);
          }}
          title={item.label}
        >
          <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
        </Button>
      ))}

      {/* Overflow items — visible only at lg+ (desktop) */}
      <div className="hidden lg:contents">
        <Button
          title="Insert table"
          onClick={() =>
            editor.dispatchCommand(INSERT_TABLE_COMMAND, {
              rows: String(5),
              columns: String(5),
            })
          }
        >
          <Image
            width={20}
            height={20}
            alt="Insert table"
            src="/insert/table.svg"
          />
        </Button>
        <Button
          title="Upload Image"
          onClick={() => {
            const inputElement = document.getElementById(
              "upload-image-toolbar",
            );
            if (!inputElement) return;
            inputElement.click();
          }}
        >
          <input
            id="upload-image-toolbar"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              onUploadImage(e, editor);
            }}
          />
          <Image
            width={20}
            height={20}
            alt="Upload image"
            src="/insert/image.svg"
          />
        </Button>
        {overflowFormattingItems.map((item: any, index: number) => (
          <Button
            key={`overflow-fmt-${index}-${item.label}`}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, item.dispatchValue);
            }}
            title={item.label}
          >
            <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
          </Button>
        ))}
        {alignmentOptions.map((item: any, index: number) => (
          <Button
            key={`overflow-align-${index}-${item.label}`}
            onClick={() => {
              editor.dispatchCommand(
                FORMAT_ELEMENT_COMMAND,
                item.dispatchValue,
              );
            }}
            title={item.label}
          >
            <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
          </Button>
        ))}
        {listOptions.map((item: any, index: number) => (
          <Button
            key={`overflow-list-${index}-${item.label}`}
            onClick={() => {
              editor.dispatchCommand(item.dispatchCommand, undefined);
            }}
            title={item.label}
          >
            <Image width={20} height={20} alt={item.label} src={item.iconSrc} />
          </Button>
        ))}
        <Button onClick={() => exportMarkDown(editor)}>Markdown</Button>
        <Select
          onChange={(value) => {
            handleHeading(editor, value);
          }}
          options={blockOptions}
          defaultValue={blockOptions[0]}
        />
      </div>

      {/* Overflow button — visible only below lg (mobile/tablet) */}
      <div className="lg:hidden">
        <OverflowButton ref={buttonRef} isOpen={isOpen} onClick={toggle} />
      </div>

      {/* Overflow popover — conditionally rendered when open */}
      {isOpen && (
        <div ref={popoverRef}>
          <OverflowPopover
            groups={overflowGroups}
            onAction={handleOverflowAction}
          />
        </div>
      )}

      {/* Collaborate link — pushed right, visible at lg+ */}
      <div className="ml-auto hidden lg:block">
        <Link
          href={switchHref}
          title={switchLabel}
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="filled"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: theme.colors.textOnDanger,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={14}
              height={14}
              alt={switchLabel}
              src={
                isCollaborationPage
                  ? "/collaboration/solo-user.svg"
                  : "/collaboration/collaborate.svg"
              }
            />
            {switchLabel}
          </Button>
        </Link>
      </div>

      {showMenu && (
        <FloatingMenu
          position={getCarretPosition(showMenu)}
          onSelect={() => {
            setShowMenu(false);
            editor.focus();
          }}
          onClose={() => {
            setShowMenu(false);
            editor.focus();
          }}
        />
      )}
    </div>
  );
};

export default Toolbar;
