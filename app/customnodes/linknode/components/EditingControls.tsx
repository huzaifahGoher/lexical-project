import React, { useState } from "react";
import { $getNodeByKey, $createTextNode, LexicalEditor } from "lexical";
import { Button, Checkbox, useTheme } from "@huzaifah191001/design-library";
import { isValidUrl } from "../utils/linkNodeUtils";
import { $isCustomLinkNode } from "../linkNode";

interface EditingControlsProps {
  nodeKey: string;
  href: string;
  target: string | null;
  editor: LexicalEditor;
  onClose: () => void;
  onRefresh: () => void;
}

export function EditingControls({
  nodeKey,
  href,
  target,
  editor,
  onClose,
  onRefresh,
}: EditingControlsProps): React.JSX.Element | null {
  const themeStyles = useTheme();

  const [editedUrl, setEditedUrl] = useState(href);
  const [isNewTab, setIsNewTab] = useState(target === "_blank");
  const [validationError, setValidationError] = useState<string | null>(null);

  const surfaceColor = themeStyles?.colors?.bg ?? "#ffffff";
  const borderColor = themeStyles?.colors?.border ?? "#e0e0e0";
  const textColor = themeStyles?.colors?.text ?? "#1a1a1a";
  const textSubtleColor = themeStyles?.colors?.textSubtle ?? "#666666";

  if (!editor.isEditable()) {
    return null;
  }

  const handleOpenLink = () => {
    window.open(href, "_blank");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(href);
  };

  const handleSave = () => {
    if (!isValidUrl(editedUrl)) {
      setValidationError("Please enter a valid URL");
      return;
    }
    setValidationError(null);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isCustomLinkNode(node)) return;
      node.setHref(editedUrl);
      node.setTarget(isNewTab ? "_blank" : null);
      node.setRel(isNewTab ? "noopener noreferrer" : null);
    });
  };

  const handleUnlink = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (!$isCustomLinkNode(node)) return;
      const textNode = $createTextNode(node.getHref());
      node.replace(textNode);
    });
    onClose();
  };

  const handleCancel = () => {
    setEditedUrl(href);
    setValidationError(null);
    onClose();
  };

  return (
    <div
      data-testid="link-preview-editing-controls"
      style={{
        padding: "12px",
        borderTop: `1px solid ${borderColor}`,
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* URL input */}
      <label style={{ fontSize: "11px", fontWeight: 500, color: textSubtleColor, marginBottom: "4px", display: "block" }}>
        URL
      </label>
      <input
        type="text"
        value={editedUrl}
        onChange={(e) => {
          setEditedUrl(e.target.value);
          if (validationError) setValidationError(null);
        }}
        style={{
          width: "100%",
          padding: "8px 10px",
          fontSize: "13px",
          color: textColor,
          backgroundColor: surfaceColor,
          border: `1px solid ${validationError ? "#dc3545" : borderColor}`,
          borderRadius: "6px",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        }}
        aria-label="Edit link URL"
        aria-invalid={validationError != null}
        aria-describedby={validationError ? "link-url-error" : undefined}
      />

      {validationError && (
        <div id="link-url-error" style={{ fontSize: "11px", color: "#dc3545", marginTop: "4px" }} role="alert">
          {validationError}
        </div>
      )}

      {/* New tab toggle */}
      <Checkbox
        checked={isNewTab}
        onChange={(val) => setIsNewTab(val)}
        label="Open in new tab"
        variant="highlighted"
      />

      {/* Action buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
        <Button onClick={handleOpenLink} title="Open link in browser" variant="subtle">
          Open
        </Button>
        <Button onClick={handleCopyUrl} title="Copy URL to clipboard" variant="subtle">
          Copy
        </Button>
        <Button onClick={onRefresh} title="Refresh preview" variant="subtle">
          Refresh
        </Button>
        <Button onClick={handleSave} title="Save changes" variant="subtle">
          Save
        </Button>
        <Button onClick={handleUnlink} title="Remove link" variant="danger">
          Unlink
        </Button>
        <Button onClick={handleCancel} title="Cancel edits" variant="danger">
          Cancel
        </Button>
      </div>
    </div>
  );
}
