import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { globalConstants } from "../../../constants/global/globalConstants";

const formattingOptions = [
  {
    dispatchValue: globalConstants.FORMATTING.BOLD,
    label: globalConstants.FORMATTING.BOLD,
  },
  {
    dispatchValue: globalConstants.FORMATTING.ITALIC,
    label: globalConstants.FORMATTING.ITALIC,
  },
  {
    dispatchValue: globalConstants.FORMATTING.UNDERLINE,
    label: globalConstants.FORMATTING.UNDERLINE,
  },
  {
    dispatchValue: globalConstants.FORMATTING.STRIKETHROUGH,
    label: globalConstants.FORMATTING.STRIKETHROUGH,
  },
  {
    dispatchValue: globalConstants.FORMATTING.CODE,
    label: globalConstants.FORMATTING.CODE,
  },
];

const alignmentOptions = [
  {
    dispatchValue: globalConstants.ALIGNMENT.LEFT,
    label: globalConstants.ALIGNMENT.LEFT,
  },
  {
    dispatchValue: globalConstants.ALIGNMENT.CENTER,
    label: globalConstants.ALIGNMENT.CENTER,
  },
  {
    dispatchValue: globalConstants.ALIGNMENT.RIGHT,
    label: globalConstants.ALIGNMENT.RIGHT,
  },
  {
    dispatchValue: globalConstants.ALIGNMENT.JUSTIFY,
    label: globalConstants.ALIGNMENT.JUSTIFY,
  },
];

const listOptions = [
  {
    dispatchCommand: INSERT_ORDERED_LIST_COMMAND,
    label: globalConstants.LIST.LABELS.NUMBER,
  },
  {
    dispatchCommand: INSERT_UNORDERED_LIST_COMMAND,
    label: globalConstants.LIST.LABELS.BULLET,
  },
];

const blockOptions = [
  { label: globalConstants.BLOCK.LABELS.NORMAL, value: globalConstants.BLOCK.VALUES.NORMAL },
  { label: globalConstants.BLOCK.LABELS.QUOTE, value: globalConstants.BLOCK.VALUES.QUOTE },
  { label: globalConstants.BLOCK.LABELS.H1, value: globalConstants.BLOCK.VALUES.H1 },
  { label: globalConstants.BLOCK.LABELS.H2, value: globalConstants.BLOCK.VALUES.H2 },
  { label: globalConstants.BLOCK.LABELS.H3, value: globalConstants.BLOCK.VALUES.H3 },
  { label: globalConstants.BLOCK.LABELS.H4, value: globalConstants.BLOCK.VALUES.H4 },
  { label: globalConstants.BLOCK.LABELS.H5, value: globalConstants.BLOCK.VALUES.H5 },
  { label: globalConstants.BLOCK.LABELS.H6, value: globalConstants.BLOCK.VALUES.H6 },
];

const undoRedoOptions = [
  { label: globalConstants.UNDO_REDO.LABELS.UNDO, command: UNDO_COMMAND },
  { label: globalConstants.UNDO_REDO.LABELS.REDO, command: REDO_COMMAND },
];

export {formattingOptions, alignmentOptions, listOptions, blockOptions, undoRedoOptions};