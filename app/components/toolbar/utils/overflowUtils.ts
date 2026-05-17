export interface OverflowItem {
  label: string;
  iconSrc?: string;
  category: "formatting" | "alignment" | "lists" | "utilities";
  action: () => void;
}

export interface OverflowGroup {
  heading: string;
  items: OverflowItem[];
}

/**
 * Labels of toolbar items that remain visible at all viewport widths.
 * These match the actual label strings from globalConstants used in toolbarConstant.ts.
 */
export const PRIMARY_LABELS = ["bold", "italic", "underline", "undo", "redo"] as const;

/**
 * Maps each overflow category to its display heading in the popover.
 */
export const CATEGORY_HEADINGS: Record<OverflowItem["category"], string> = {
  formatting: "Formatting",
  alignment: "Alignment",
  lists: "Lists",
  utilities: "Utilities",
};

/**
 * Defines the order in which groups appear in the overflow popover.
 */
export const GROUP_ORDER: OverflowItem["category"][] = [
  "formatting",
  "alignment",
  "lists",
  "utilities",
];

/**
 * Determines whether a toolbar item is a primary item (always visible)
 * or an overflow item (hidden behind the ⋯ button on narrow viewports).
 */
export function isPrimaryItem(label: string): boolean {
  return PRIMARY_LABELS.includes(label as (typeof PRIMARY_LABELS)[number]);
}

/**
 * Partitions all toolbar items into primary and overflow sets.
 * Primary items are returned in the canonical order: bold, italic, underline, undo, redo.
 * Every item appears in exactly one of the two sets.
 */
export function partitionToolbarItems<T extends { label: string }>(
  items: T[]
): { primary: T[]; overflow: T[] } {
  const primary: T[] = [];
  const overflow: T[] = [];

  for (const item of items) {
    if (isPrimaryItem(item.label)) {
      primary.push(item);
    } else {
      overflow.push(item);
    }
  }

  // Sort primary items into canonical order
  primary.sort(
    (a, b) =>
      PRIMARY_LABELS.indexOf(a.label as (typeof PRIMARY_LABELS)[number]) -
      PRIMARY_LABELS.indexOf(b.label as (typeof PRIMARY_LABELS)[number])
  );

  return { primary, overflow };
}

/**
 * Groups overflow items by category and returns them with headings
 * in the defined group order. Categories with no items are omitted.
 */
export function groupOverflowItems(items: OverflowItem[]): OverflowGroup[] {
  const grouped = new Map<OverflowItem["category"], OverflowItem[]>();

  for (const item of items) {
    const existing = grouped.get(item.category) ?? [];
    existing.push(item);
    grouped.set(item.category, existing);
  }

  return GROUP_ORDER.filter((cat) => grouped.has(cat)).map((cat) => ({
    heading: CATEGORY_HEADINGS[cat],
    items: grouped.get(cat)!,
  }));
}

/**
 * Derives the aria-expanded value from the popover open state.
 */
export function getAriaExpanded(isOpen: boolean): boolean {
  return isOpen;
}
