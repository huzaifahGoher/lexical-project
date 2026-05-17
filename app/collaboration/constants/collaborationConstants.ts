/**
 * Collaboration color palette - 12 visually distinct colors assigned round-robin
 * based on client join order. Each color has a full-opacity variant for cursor labels
 * and a light variant (30% opacity) for selection highlights.
 */
export const COLLABORATION_COLORS: Array<{ color: string; colorLight: string }> = [
  { color: '#E91E63', colorLight: '#E91E6330' }, // Pink
  { color: '#2196F3', colorLight: '#2196F330' }, // Blue
  { color: '#4CAF50', colorLight: '#4CAF5030' }, // Green
  { color: '#FF9800', colorLight: '#FF980030' }, // Orange
  { color: '#9C27B0', colorLight: '#9C27B030' }, // Purple
  { color: '#00BCD4', colorLight: '#00BCD430' }, // Cyan
  { color: '#F44336', colorLight: '#F4433630' }, // Red
  { color: '#3F51B5', colorLight: '#3F51B530' }, // Indigo
  { color: '#009688', colorLight: '#00968830' }, // Teal
  { color: '#FF5722', colorLight: '#FF572230' }, // Deep Orange
  { color: '#607D8B', colorLight: '#607D8B30' }, // Blue Grey
  { color: '#795548', colorLight: '#79554830' }, // Brown
];

/** Default WebSocket server URL for the y-websocket collaboration server */
export const DEFAULT_WEBSOCKET_URL = 'ws://localhost:1234';

/** Default room identifier for the shared collaboration session */
export const DEFAULT_ROOM_ID = 'default-room';

/** Base delay in milliseconds for exponential backoff reconnection */
export const RECONNECTION_BASE_DELAY = 1000; // 1 second

/** Maximum delay in milliseconds for exponential backoff reconnection */
export const RECONNECTION_MAX_DELAY = 30000; // 30 seconds

/** Minimum interval between awareness broadcasts in milliseconds */
export const AWARENESS_THROTTLE_MS = 200; // max 5 updates per second

/** Maximum number of awareness updates allowed per second per client */
export const MAX_AWARENESS_UPDATES_PER_SECOND = 5;

/** Timeout in milliseconds before transitioning to offline status */
export const CONNECTION_TIMEOUT_MS = 30000; // 30 seconds before offline

/** Debounce interval for rapid connect/disconnect cycles */
export const DEBOUNCE_CONNECT_MS = 500; // debounce rapid connect/disconnect

/**
 * Compute a text color (black or white) that ensures sufficient contrast
 * against the given background color. Uses relative luminance calculation
 * per WCAG 2.1 guidelines.
 */
export function getContrastTextColor(hexColor: string): string {
  // Parse hex color
  const r = parseInt(hexColor.slice(1, 3), 16) / 255;
  const g = parseInt(hexColor.slice(3, 5), 16) / 255;
  const b = parseInt(hexColor.slice(5, 7), 16) / 255;

  // Calculate relative luminance
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.179 ? '#000000' : '#ffffff';
}
