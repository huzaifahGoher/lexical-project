import { Button, useTheme } from "@huzaifah191001/design-library";
import { forwardRef } from "react";

interface OverflowButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const OverflowButton = forwardRef<HTMLButtonElement, OverflowButtonProps>(
  ({ isOpen, onClick }, ref) => {
    const theme = useTheme();

    return (
      <Button
        ref={ref}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-label="More formatting options"
        title="More formatting options"
        style={{ fontSize: theme.fontSizes.lg }}
      >
        ⋯
      </Button>
    );
  }
);

OverflowButton.displayName = "OverflowButton";
export default OverflowButton;
