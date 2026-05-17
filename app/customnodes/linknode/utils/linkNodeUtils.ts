/**
 * URL utility functions for the CustomLinkNode system.
 * Handles URL normalization, validation, and standalone detection.
 */

/**
 * Normalizes a URL by prepending `https://` if no protocol is present.
 * If the URL already has http:// or https://, it is returned unchanged.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validates whether a string is a structurally valid URL.
 * Must have a valid TLD and no invalid characters.
 * Rejects non-URL text like sentences, numbers, and file paths.
 */
export function isValidUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  // Normalize for validation purposes
  const urlString = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  // Use URL constructor for basic structural validation
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return false;
  }

  // Must be http or https protocol
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  // Hostname must have a valid TLD (at least one dot with a TLD of 2+ chars)
  const hostname = parsed.hostname;
  if (!hostname.includes(".")) return false;

  const parts = hostname.split(".");
  const tld = parts[parts.length - 1];

  // TLD must be at least 2 characters and only alphabetic
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;

  // Reject if hostname has invalid characters (only allow alphanumeric, dots, hyphens)
  if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) return false;

  // Each label in the hostname must not start or end with a hyphen
  for (const part of parts) {
    if (part.startsWith("-") || part.endsWith("-") || part.length === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Returns true only if the entire string (trimmed) is a single URL.
 * Returns false for URLs embedded within larger text.
 */
export function isStandaloneUrl(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Must not contain whitespace within the URL itself (after trimming)
  if (/\s/.test(trimmed)) return false;

  return isValidUrl(trimmed);
}
