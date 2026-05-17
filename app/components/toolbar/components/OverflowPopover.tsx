import { Button, useTheme } from "@huzaifah191001/design-library";
import Image from "next/image";
import { OverflowGroup, OverflowItem } from "../utils/overflowUtils";

interface OverflowPopoverProps {
  groups: OverflowGroup[];
  onAction: (item: OverflowItem) => void;
}

const OverflowPopover = ({ groups, onAction }: OverflowPopoverProps) => {
  const theme = useTheme();

  return (
    <div
      role="menu"
      className="absolute top-full right-0 mt-1 z-50 rounded shadow-lg min-w-48"
      style={{
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.borderStrong}`,
        padding: theme.spacing.sm,
      }}
    >
      {groups.map((group, groupIndex) => (
        <div key={group.heading}>
          {groupIndex > 0 && (
            <hr
              className="my-2"
              style={{ borderColor: theme.colors.border }}
            />
          )}
          <p
            className="text-xs font-medium uppercase mb-1 px-1"
            style={{ color: theme.colors.textMuted }}
          >
            {group.heading}
          </p>
          <div className="flex flex-row flex-wrap gap-1">
            {group.items.map((item) => (
              <Button
                key={item.label}
                onClick={() => onAction(item)}
                title={item.label}
                role="menuitem"
              >
                {item.iconSrc ? (
                  <Image
                    width={20}
                    height={20}
                    alt={item.label}
                    src={item.iconSrc}
                  />
                ) : (
                  item.label
                )}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverflowPopover;
