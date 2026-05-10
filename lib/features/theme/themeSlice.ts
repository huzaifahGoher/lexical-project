import { PayloadAction } from "@reduxjs/toolkit";

export type themeType = "light" | "dark";
type stateType = { theme: themeType };
const initialState: stateType = { theme: "light" };

export const initializeState = () : stateType => {
  return initialState;
}

export const themeReducer = (state = initialState, action: PayloadAction<"light" | "dark">) => {
  switch (action.type) {
    case "theme/setLight":
      return {
        theme: "light",
      };
    case "theme/setDark":
      return {
        theme: "dark",
      };
    case "theme/setTheme":
      return {
        theme: action.payload,
      };
    default:
      return state;
  }
};
