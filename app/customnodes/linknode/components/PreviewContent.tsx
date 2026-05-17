import React from "react";
import { Button, useTheme } from "@huzaifah191001/design-library";
import { FetchStatus, PreviewMetadata } from "../types/linkNodeTypes";

interface PreviewContentProps {
  fetchStatus: FetchStatus;
  previewMetadata: PreviewMetadata | null;
  href: string;
  onRetry: () => void;
}

export function PreviewContent({
  fetchStatus,
  previewMetadata,
  href,
  onRetry,
}: PreviewContentProps): React.JSX.Element {
  const themeStyles = useTheme();

  const borderColor = themeStyles?.colors?.border ?? "#e0e0e0";
  const textColor = themeStyles?.colors?.text ?? "#1a1a1a";
  const textSubtleColor = themeStyles?.colors?.textSubtle ?? "#666666";
  const accentColor = themeStyles?.colors?.actionPrimary ?? "#007acc";

  switch (fetchStatus) {
    case FetchStatus.IDLE:
    case FetchStatus.LOADING:
      return <LoadingSkeleton borderColor={borderColor} />;
    case FetchStatus.SUCCESS:
      return (
        <SuccessContent
          metadata={previewMetadata}
          href={href}
          textColor={textColor}
          textSubtleColor={textSubtleColor}
          accentColor={accentColor}
        />
      );
    case FetchStatus.ERROR:
      return (
        <ErrorContent
          href={href}
          textSubtleColor={textSubtleColor}
          accentColor={accentColor}
          onRetry={onRetry}
        />
      );
    default:
      return <LoadingSkeleton borderColor={borderColor} />;
  }
}

// --- Loading Skeleton ---

function LoadingSkeleton({ borderColor }: { borderColor: string }): React.JSX.Element {
  const skeletonBase: React.CSSProperties = {
    backgroundColor: borderColor,
    borderRadius: "4px",
    animation: "pulse 1.5s ease-in-out infinite",
  };

  return (
    <div style={{ padding: "12px" }} data-testid="link-preview-loading">
      <div
        style={{ ...skeletonBase, width: "100%", paddingBottom: "56.25%", marginBottom: "12px", borderRadius: "4px 4px 0 0" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <div style={{ ...skeletonBase, width: "16px", height: "16px", borderRadius: "50%" }} />
        <div style={{ ...skeletonBase, width: "100px", height: "12px" }} />
      </div>
      <div style={{ ...skeletonBase, width: "80%", height: "16px", marginBottom: "8px" }} />
      <div style={{ ...skeletonBase, width: "100%", height: "12px", marginBottom: "4px" }} />
      <div style={{ ...skeletonBase, width: "60%", height: "12px" }} />
    </div>
  );
}

// --- Success Content ---

interface SuccessContentProps {
  metadata: PreviewMetadata | null;
  href: string;
  textColor: string;
  textSubtleColor: string;
  accentColor: string;
}

function SuccessContent({ metadata, href, textColor, textSubtleColor, accentColor }: SuccessContentProps): React.JSX.Element {
  const hasTitle = metadata?.title != null && metadata.title.length > 0;
  const hasDescription = metadata?.description != null && metadata.description.length > 0;
  const hasImage = metadata?.image != null && metadata.image.length > 0;
  const hasFavicon = metadata?.favicon != null && metadata.favicon.length > 0;

  if (!hasTitle && !hasDescription) {
    return (
      <div style={{ padding: "12px" }} data-testid="link-preview-success">
        {hasImage && <ThumbnailImage src={metadata!.image!} alt="" roundTop={false} />}
        {metadata && <FaviconDomain favicon={hasFavicon ? metadata.favicon : null} domain={metadata.domain} color={textSubtleColor} />}
        <span style={{ fontSize: "14px", fontWeight: 600, color: accentColor, wordBreak: "break-all" }}>
          {href}
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: "0" }} data-testid="link-preview-success">
      {hasImage && <ThumbnailImage src={metadata!.image!} alt={metadata?.title ?? ""} roundTop={true} />}
      <div style={{ padding: "12px" }}>
        {metadata && <FaviconDomain favicon={hasFavicon ? metadata.favicon : null} domain={metadata.domain} color={textSubtleColor} />}
        {hasTitle && (
          <div style={{ fontSize: "15px", fontWeight: 600, color: textColor, marginBottom: "4px", lineHeight: "1.3" }}>
            {metadata!.title}
          </div>
        )}
        {hasDescription && (
          <div
            style={{
              fontSize: "13px",
              color: textSubtleColor,
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {metadata!.description}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Error Content ---

interface ErrorContentProps {
  href: string;
  textSubtleColor: string;
  accentColor: string;
  onRetry: () => void;
}

function ErrorContent({ href, textSubtleColor, accentColor, onRetry }: ErrorContentProps): React.JSX.Element {
  return (
    <div style={{ padding: "12px" }} data-testid="link-preview-error">
      <div style={{ fontSize: "13px", color: textSubtleColor, marginBottom: "8px", wordBreak: "break-all" }}>
        <span style={{ color: accentColor }}>{href}</span>
      </div>
      <Button onClick={onRetry} title="Retry loading preview">
        Retry
      </Button>
    </div>
  );
}

// --- Shared sub-components ---

function ThumbnailImage({ src, alt, roundTop }: { src: string; alt: string; roundTop: boolean }): React.JSX.Element {
  return (
    <div
      style={{
        width: "100%",
        paddingBottom: "56.25%",
        position: "relative",
        overflow: "hidden",
        borderRadius: roundTop ? "12px 12px 0 0" : "4px 4px 0 0",
        marginBottom: roundTop ? undefined : "12px",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function FaviconDomain({ favicon, domain, color }: { favicon: string | null; domain: string; color: string }): React.JSX.Element {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
      {favicon && <img src={favicon} alt="" style={{ width: "16px", height: "16px", borderRadius: "2px" }} />}
      <span style={{ fontSize: "12px", color }}>{domain}</span>
    </div>
  );
}
