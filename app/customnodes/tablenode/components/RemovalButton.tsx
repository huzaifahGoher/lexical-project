import React from "react";
import { RemovalButtonProps } from "../types/tableDecoratorTypes";

export function RemovalButton({
  position,
  onClick,
  ariaLabel = "Remove column",
  title,
  onMouseEnter,
  onMouseLeave,
}: RemovalButtonProps): React.JSX.Element {
  return (
    <button
      className="table-removal-button"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
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
      ×
    </button>
  );
}
