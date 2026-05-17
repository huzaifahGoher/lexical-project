import React, { useEffect, useRef, useState, useCallback } from "react";
import { LexicalEditor, $getNodeByKey } from "lexical";
import "./LinkNodeDecorator.css";
import { LinkPreviewCard } from "./components/LinkPreviewCard";
import { $isCustomLinkNode } from "./linkNode";
import { FetchStatus, PreviewMetadata } from "./types/linkNodeTypes";
import { useLinkNodeSelection } from "./hooks/useLinkNodeSelection";

const HOVER_SHOW_DELAY = 150; // ms before showing card
const HOVER_HIDE_GRACE = 100; // ms grace period before closing

interface LinkNodeDecoratorProps {
  nodeKey: string;
  editor: LexicalEditor;
}

export function LinkNodeDecorator({
  nodeKey,
  editor,
}: LinkNodeDecoratorProps): React.JSX.Element | null {
  const [showCard, setShowCard] = useState(false);
  const [nodeData, setNodeData] = useState<{
    href: string;
    target: string | null;
    rel: string | null;
    previewMetadata: PreviewMetadata | null;
    fetchStatus: FetchStatus;
  } | null>(null);

  const isHoveringLinkRef = useRef(false);
  const isHoveringCardRef = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorElementRef = useRef<HTMLElement | null>(null);

  // Selection tracking + visual highlight + delete/backspace
  useLinkNodeSelection({ nodeKey, editor });

  // Read node data from editor state
  const readNodeData = useCallback(() => {
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isCustomLinkNode(node)) return;

      const newData = {
        href: node.getHref(),
        target: node.getTarget(),
        rel: node.getRel(),
        previewMetadata: node.getPreviewMetadata(),
        fetchStatus: node.getFetchStatus(),
      };

      setNodeData((prev) => {
        // Only update if something actually changed
        if (
          prev &&
          prev.href === newData.href &&
          prev.target === newData.target &&
          prev.rel === newData.rel &&
          prev.fetchStatus === newData.fetchStatus &&
          prev.previewMetadata === newData.previewMetadata
        ) {
          return prev;
        }
        return newData;
      });
    });
  }, [editor, nodeKey]);

  // Cancel all pending timers
  const clearTimers = useCallback(() => {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Attempt to hide the card after grace period
  const scheduleHide = useCallback(() => {
    // Cancel any pending show timer
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      // Only hide if cursor is not over link or card
      if (!isHoveringLinkRef.current && !isHoveringCardRef.current) {
        setShowCard(false);
      }
    }, HOVER_HIDE_GRACE);
  }, []);

  // Cancel hide if cursor re-enters link or card
  const cancelHide = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Attach mouseenter/mouseleave listeners to the link's DOM element
  useEffect(() => {
    const element = editor.getElementByKey(nodeKey);
    if (!element) return;

    anchorElementRef.current = element;

    const handleMouseEnter = () => {
      isHoveringLinkRef.current = true;
      cancelHide();

      // Start 150ms delay before showing card
      showTimerRef.current = setTimeout(() => {
        showTimerRef.current = null;
        readNodeData();
        setShowCard(true);
      }, HOVER_SHOW_DELAY);
    };

    const handleMouseLeave = () => {
      isHoveringLinkRef.current = false;
      scheduleHide();
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      clearTimers();
    };
  }, [editor, nodeKey, readNodeData, scheduleHide, cancelHide, clearTimers]);

  // Listen for node updates to keep nodeData in sync while card is open
  useEffect(() => {
    if (!showCard) return;

    const unregister = editor.registerUpdateListener(() => {
      readNodeData();
    });

    return unregister;
  }, [showCard, editor, readNodeData]);

  // Card hover handlers
  const handleCardMouseEnter = useCallback(() => {
    isHoveringCardRef.current = true;
    cancelHide();
  }, [cancelHide]);

  const handleCardMouseLeave = useCallback(() => {
    isHoveringCardRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  // Close handler for the card
  const handleClose = useCallback(() => {
    clearTimers();
    isHoveringLinkRef.current = false;
    isHoveringCardRef.current = false;
    setShowCard(false);
  }, [clearTimers]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  if (!showCard || !nodeData || !anchorElementRef.current) {
    return null;
  }

  return (
    <div
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      style={{ display: "contents" }}
    >
      <LinkPreviewCard
        nodeKey={nodeKey}
        href={nodeData.href}
        target={nodeData.target}
        rel={nodeData.rel}
        previewMetadata={nodeData.previewMetadata}
        fetchStatus={nodeData.fetchStatus}
        editor={editor}
        anchorElement={anchorElementRef.current}
        onClose={handleClose}
      />
    </div>
  );
}
