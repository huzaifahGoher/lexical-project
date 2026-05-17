import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { RootState } from "@/lib/store";
import { useTheme } from "@huzaifah191001/design-library";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, EditorState } from "lexical";
import Image from "next/image";
import React, { useState, useRef, useCallback } from "react";

const StatusBarPlugin = () => {
  const dispatch = useAppDispatch();
  const themeStyles = useTheme();
  const theme = useAppSelector((state: RootState) => state.themeObject.theme);
  const [minimized, setMinimized] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState({
    wordCount: 0,
    readingTime: 0,
    characterCount: 0,
  });

  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      const characterCount = root.getTextContentSize();
      const wordCount = text.split(" ").length || 0;
      const readingTime = Math.ceil(wordCount / 200);

      setData({ wordCount, readingTime, characterCount });
    });

    // Flash the minimized circle border on changes
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    setFlashing(true);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashing(false);
    }, 600);
  }, []);

  // Minimized state: breathing circle
  if (minimized) {
    return (
      <>
        <button
          onClick={() => setMinimized(false)}
          title="Open status bar"
          aria-label="Open status bar"
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: `2px solid ${flashing ? themeStyles.colors.actionPrimary : themeStyles.colors.border}`,
            backgroundColor: themeStyles.colors.bgRaised,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: flashing
              ? `0 0 8px ${themeStyles.colors.actionPrimary}40`
              : `0 2px 8px ${theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.12)"}`,
            animation: "statusBarBreathe 2.5s ease-in-out infinite",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            zIndex: 40,
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: themeStyles.colors.actionPrimary,
            }}
          />
        </button>
        <style>{`
          @keyframes statusBarBreathe {
            0%, 100% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.08); opacity: 1; }
          }
        `}</style>
        <OnChangePlugin onChange={handleChange} />
      </>
    );
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          width: "220px",
          borderRadius: themeStyles.borderRadius.md,
          border: `1px solid ${themeStyles.colors.border}`,
          backgroundColor: themeStyles.colors.bgRaised,
          boxShadow: `0 4px 16px ${theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)"}`,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontSize: themeStyles.fontSizes.sm,
          color: themeStyles.colors.text,
          zIndex: 40,
        }}
      >
        {/* Header with theme toggle and minimize */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: themeStyles.colors.textMuted, fontWeight: 500 }}>
              {theme === "dark" ? "Dark" : "Light"}
            </span>
            <Image
              style={{ cursor: "pointer", borderRadius: "4px" }}
              onClick={() => {
                dispatch({
                  type: "theme/setTheme",
                  payload: theme === "light" ? "dark" : "light",
                });
              }}
              width={16}
              height={16}
              alt="Toggle theme"
              src={theme === "dark" ? "./light-theme.svg" : "./dark-theme.svg"}
            />
          </div>
          <button
            onClick={() => setMinimized(true)}
            title="Minimize status bar"
            aria-label="Minimize status bar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              color: themeStyles.colors.textMuted,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: themeStyles.colors.border }} />

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: themeStyles.colors.textMuted }}>Words</span>
            <span style={{ fontWeight: 600 }}>{data.wordCount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: themeStyles.colors.textMuted }}>Characters</span>
            <span style={{ fontWeight: 600 }}>{data.characterCount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: themeStyles.colors.textMuted }}>Reading time</span>
            <span style={{ fontWeight: 600 }}>{data.readingTime} min</span>
          </div>
        </div>
      </div>
      <OnChangePlugin onChange={handleChange} />
    </>
  );
};

export default StatusBarPlugin;
