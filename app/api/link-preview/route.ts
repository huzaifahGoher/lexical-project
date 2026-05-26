import { type NextRequest } from "next/server";
import { LinkPreviewAPIResponse } from "@/app/customnodes/linknode/types/linkNodeTypes";

/**
 * Validates whether a string is a well-formed URL with http/https protocol.
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extracts the domain from a URL string.
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return "";
  }
}

/**
 * Extracts Open Graph meta tag content from HTML.
 * Falls back to standard meta tags and title element.
 */
function parseMetadata(html: string, url: string): Omit<LinkPreviewAPIResponse, "error"> {
  const domain = extractDomain(url);

  // Extract og:title, fallback to <title>
  const ogTitle = getMetaContent(html, 'property="og:title"') ??
    getMetaContent(html, "property=\"og:title\"") ??
    getTitleTag(html);

  // Extract og:description, fallback to <meta name="description">
  const ogDescription = getMetaContent(html, 'property="og:description"') ??
    getMetaContent(html, "property=\"og:description\"") ??
    getMetaContent(html, 'name="description"') ??
    getMetaContent(html, "name=\"description\"");

  // Extract og:image
  const ogImage = getMetaContent(html, 'property="og:image"') ??
    getMetaContent(html, "property=\"og:image\"");

  const favicon = extractFavicon(html, url);

  return {
    title: ogTitle || null,
    description: ogDescription || null,
    image: ogImage ? resolveUrl(ogImage, url) : null,
    favicon,
    domain,
  };
}

/**
 * Extracts meta tag content by matching the attribute pattern.
 */
function getMetaContent(html: string, attributePattern: string): string | null {
  // Match meta tags with the given attribute pattern, handling both orderings:
  // <meta property="og:title" content="..."> or <meta content="..." property="og:title">
  const regex1 = new RegExp(
    `<meta[^>]*${escapeRegex(attributePattern)}[^>]*content=["']([^"']*)["'][^>]*/?>`,
    "i"
  );
  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${escapeRegex(attributePattern)}[^>]*/?>`,
    "i"
  );

  const match1 = html.match(regex1);
  if (match1?.[1]) return decodeHtmlEntities(match1[1]);

  const match2 = html.match(regex2);
  if (match2?.[1]) return decodeHtmlEntities(match2[1]);

  return null;
}

/**
 * Extracts the content of the <title> tag.
 */
function getTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null;
}

/**
 * Extracts the favicon URL from HTML.
 * Checks <link rel="icon"> and <link rel="shortcut icon">, falls back to /favicon.ico.
 */
function extractFavicon(html: string, url: string): string | null {
  // Match <link rel="icon" href="..."> or <link rel="shortcut icon" href="...">
  const iconRegex = /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["'][^>]*\/?>/i;
  const iconRegex2 = /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["'][^>]*\/?>/i;

  const match = html.match(iconRegex) || html.match(iconRegex2);
  if (match?.[1]) {
    return resolveUrl(match[1], url);
  }

  // Fallback to /favicon.ico
  try {
    const parsed = new URL(url);
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

/**
 * Resolves a potentially relative URL against a base URL.
 */
function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

/**
 * Decodes common HTML entities.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/link-preview?url=<encoded-url>
 *
 * Fetches metadata for a given URL and returns a LinkPreviewAPIResponse.
 * - 400: Missing or invalid URL parameter
 * - 502: Network failure fetching the target page
 * - 504: Timeout fetching the target page
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  // Validate URL parameter
  if (!url) {
    return Response.json(
      { title: null, description: null, favicon: null, image: null, domain: "", error: "Missing url parameter" } satisfies LinkPreviewAPIResponse,
      { status: 400 }
    );
  }

  if (!isValidUrl(url)) {
    return Response.json(
      { title: null, description: null, favicon: null, image: null, domain: "", error: "Invalid url parameter" } satisfies LinkPreviewAPIResponse,
      { status: 400 }
    );
  }

  // Fetch the target page with a 10-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    // Even if the response is not OK, try to parse what we can
    const html = await response.text();
    const metadata = parseMetadata(html, url);

    return Response.json(metadata satisfies LinkPreviewAPIResponse, { status: 200 });
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // Check if the error is an abort (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      const domain = extractDomain(url);
      return Response.json(
        { title: null, description: null, favicon: null, image: null, domain, error: "Request timed out" } satisfies LinkPreviewAPIResponse,
        { status: 504 }
      );
    }

    // Network failure
    const domain = extractDomain(url);
    return Response.json(
      { title: null, description: null, favicon: null, image: null, domain, error: "Failed to fetch URL" } satisfies LinkPreviewAPIResponse,
      { status: 502 }
    );
  }
}
