import React from "react";
import { InsertionButtonProps } from "../types/tableDecoratorTypes";

export function InsertionButton({
  position,
  onClick,
  accentColor,
  accentForeground,
  ariaLabel = "Insert column",
  title,
  onMouseEnter,
  onMouseLeave,
}: InsertionButtonProps): React.JSX.Element {
  return (
    <button
      className="table-insertion-button"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: accentColor,
        color: accentForeground,
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      type="button"
    >
      +
    </button>
  );
}
