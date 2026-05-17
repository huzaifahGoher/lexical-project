import { useState, useEffect, useCallback, useRef } from "react";

type Placement = "above" | "below";

interface HoverPosition {
  top: number;
  left: number;
  placement: Placement;
}

interface UseHoverPositionParams {
  anchorElement: HTMLElement | null;
  cardDimensions: { width: number; height: number };
}

const CARD_OFFSET = 8; // Gap between anchor and card

function calculatePosition(
  anchorElement: HTMLElement,
  cardWidth: number,
  cardHeight: number
): HoverPosition {
  const anchorRect = anchorElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Default placement: below the anchor, centered horizontally
  let placement: Placement = "below";
  let top = anchorRect.bottom + CARD_OFFSET;
  let left = anchorRect.left + anchorRect.width / 2 - cardWidth / 2;

  // Flip above if not enough space below
  if (top + cardHeight > viewportHeight) {
    placement = "above";
    top = anchorRect.top - cardHeight - CARD_OFFSET;
  }

  // Shift left if overflowing right edge
  if (left + cardWidth > viewportWidth) {
    left = viewportWidth - cardWidth;
  }

  // Shift right if overflowing left edge
  if (left < 0) {
    left = 0;
  }

  return { top, left, placement };
}

export function useHoverPosition({
  anchorElement,
  cardDimensions,
}: UseHoverPositionParams): HoverPosition {
  const [position, setPosition] = useState<HoverPosition>({
    top: 0,
    left: 0,
    placement: "below",
  });

  // Store dimensions in a ref to avoid re-creating the callback on every render
  const dimensionsRef = useRef(cardDimensions);
  dimensionsRef.current = cardDimensions;

  const updatePosition = useCallback(() => {
    if (!anchorElement) {
      return;
    }
    const { width, height } = dimensionsRef.current;
    const newPosition = calculatePosition(anchorElement, width, height);
    setPosition((prev) => {
      // Only update if position actually changed to avoid unnecessary re-renders
      if (prev.top === newPosition.top && prev.left === newPosition.left && prev.placement === newPosition.placement) {
        return prev;
      }
      return newPosition;
    });
  }, [anchorElement]);

  useEffect(() => {
    if (!anchorElement) {
      return;
    }

    updatePosition();

    // Listen to scroll (with capture for nested scrollable containers) and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [anchorElement, updatePosition]);

  return position;
}
