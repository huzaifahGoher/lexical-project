import { initializeState, themeType } from "@/lib/features/theme/themeSlice";
import { useAppSelector, useAppStore } from "@/lib/hook";
import { RootState } from "@/lib/store";
import {
  darkSemantic,
  semantic,
  ThemeProvider,
} from "@huzaifah191001/design-library";
import React, { useRef } from "react";
import Editor from "../editor/Editor";

const Main = () => {
  const store = useAppStore();
  const initialized = useRef(false);
  if (!initialized.current) {
    store.dispatch(initializeState);
    initialized.current = true;
  }
  const themeType = useAppSelector(
    (state: RootState) => state.themeObject.theme
  ) as themeType;
  const theme = themeType == "dark" ? darkSemantic : semantic;

  return (
    <ThemeProvider themeType={themeType}>
      <div
        className="p-2 flex flex-col flex-1 font-sans"
        style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
      >
        <Editor />
      </div>
    </ThemeProvider>
  );
};

export default Main;
