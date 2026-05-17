import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@huzaifah191001/design-library";
import { LinkPreviewCardProps, FetchStatus } from "../types/linkNodeTypes";
import { useHoverPosition } from "../hooks/useHoverPosition";
import { useLinkPreviewFetch } from "../hooks/useLinkPreviewFetch";
import { PreviewContent } from "./PreviewContent";
import { EditingControls } from "./EditingControls";

const CARD_WIDTH = 380;
const CARD_MIN_WIDTH = 320;
const CARD_MAX_WIDTH = 420;
const CARD_ESTIMATED_HEIGHT = 280;

function getAriaLiveMessage(fetchStatus: FetchStatus): string {
  switch (fetchStatus) {
    case FetchStatus.LOADING:
      return "Loading link preview...";
    case FetchStatus.SUCCESS:
      return "Link preview loaded";
    case FetchStatus.ERROR:
      return "Failed to load link preview";
    default:
      return "";
  }
}

export function LinkPreviewCard({
  nodeKey,
  href,
  target,
  previewMetadata,
  fetchStatus,
  editor,
  anchorElement,
  onClose,
}: LinkPreviewCardProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const themeStyles = useTheme();

  const surfaceColor = themeStyles?.colors?.bg ?? "#ffffff";
  const borderColor = themeStyles?.colors?.border ?? "#e0e0e0";
  const textColor = themeStyles?.colors?.text ?? "#1a1a1a";

  const { top, left, placement } = useHoverPosition({
    anchorElement,
    cardDimensions: { width: CARD_WIDTH, height: CARD_ESTIMATED_HEIGHT },
  });

  const { refetch } = useLinkPreviewFetch({
    nodeKey,
    editor,
    fetchStatus,
    href,
  });

  // Open animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        anchorElement.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, anchorElement]);

  if (typeof document === "undefined") {
    return null;
  }

  const transformOrigin = placement === "above" ? "bottom center" : "top center";
  const initialTranslateY = placement === "above" ? "4px" : "-4px";

  const cardStyle: React.CSSProperties = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${CARD_MIN_WIDTH}px`,
    maxWidth: `${CARD_MAX_WIDTH}px`,
    width: `${CARD_WIDTH}px`,
    borderRadius: "12px",
    backgroundColor: surfaceColor,
    border: `1px solid ${borderColor}`,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0,0,0,0.05)",
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : `translateY(${initialTranslateY})`,
    transformOrigin,
    transition: "opacity 200ms ease-out, transform 200ms ease-out",
    zIndex: 9999,
    overflow: "hidden",
    color: textColor,
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  };

  const srOnlyStyle: React.CSSProperties = {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
  };

  const cardContent = (
    <div
      ref={cardRef}
      style={cardStyle}
      data-testid="link-preview-card"
      role="dialog"
      aria-label={`Link preview for ${href}`}
      tabIndex={-1}
    >
      <PreviewContent
        fetchStatus={fetchStatus}
        previewMetadata={previewMetadata}
        href={href}
        onRetry={refetch}
      />

      <EditingControls
        nodeKey={nodeKey}
        href={href}
        target={target}
        editor={editor}
        onClose={onClose}
        onRefresh={refetch}
      />

      <div aria-live="polite" aria-atomic="true" style={srOnlyStyle}>
        {getAriaLiveMessage(fetchStatus)}
      </div>
    </div>
  );

  return createPortal(cardContent, document.body);
}
