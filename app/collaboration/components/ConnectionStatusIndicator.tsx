'use client';

import React from 'react';
import { useTheme } from '@huzaifah191001/design-library';

import type { ConnectionStatus } from '../types/collaborationTypes';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

/**
 * Status configuration mapping each connection state to its icon, label, and color.
 */
const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; iconColor: string }
> = {
  connecting: { label: 'Connecting...', iconColor: '#6b7280' },
  connected: { label: 'Connected', iconColor: '#22c55e' },
  reconnecting: { label: 'Reconnecting...', iconColor: '#f59e0b' },
  offline: { label: 'Offline', iconColor: '#ef4444' },
};

/**
 * Renders a spinning circle icon for connecting/reconnecting states.
 */
function SpinnerIcon({ color }: { color: string }) {
  return (
    <svg
      className="animate-spin"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="6"
        cy="6"
        r="5"
        stroke={color}
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path
        d="M6 1a5 5 0 0 1 5 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Renders a solid dot icon for connected/offline states.
 */
function DotIcon({ color }: { color: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="5" cy="5" r="5" fill={color} />
    </svg>
  );
}

/**
 * Renders the appropriate icon for the given connection status.
 */
function StatusIcon({ status, color }: { status: ConnectionStatus; color: string }) {
  switch (status) {
    case 'connecting':
    case 'reconnecting':
      return <SpinnerIcon color={color} />;
    case 'connected':
    case 'offline':
      return <DotIcon color={color} />;
  }
}

/**
 * ConnectionStatusIndicator displays the current WebSocket connection state
 * as a compact pill/badge with an icon and label. Uses theme colors for
 * container styling and smooth CSS transitions for state changes.
 */
function ConnectionStatusIndicator({ status }: ConnectionStatusIndicatorProps) {
  const themeStyles = useTheme();

  const bgColor = themeStyles?.colors?.bg ?? '#ffffff';
  const textColor = themeStyles?.colors?.text ?? '#1a1a1a';
  const borderColor = themeStyles?.colors?.border ?? '#e0e0e0';

  const config = STATUS_CONFIG[status];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${config.label}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <StatusIcon status={status} color={config.iconColor} />
      <span>{config.label}</span>
    </div>
  );
}

export default React.memo(ConnectionStatusIndicator);
