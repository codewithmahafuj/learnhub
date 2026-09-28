/**
 * YouTube URL parsing (Step 6 Part 6).
 *
 * PURE and server-safe: string in, id out — no fetch, no API keys, no
 * external dependencies. Shared by the server actions (authoritative
 * validation + id derivation) and safe to reuse client-side (e.g. the admin
 * form preview) because it is side-effect free.
 *
 * Only metadata is ever stored: youtubeUrl (normalized) + youtubeVideoId.
 * The URL is never fetched and no video data is downloaded.
 */

/** Hostnames that are allowed to host YouTube videos. */
const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

/**
 * YouTube video IDs are 11 characters of [A-Za-z0-9_-]. Matching the full
 * string with anchors guards against junk around a coincidentally
 * well-shaped segment.
 */
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function extractIdFromSegment(candidate: string | undefined): string | null {
  if (!candidate) return null;
  // Strip a trailing query string if the path arrived unnormalized.
  const bare = candidate.split("?")[0].split("#")[0];
  return VIDEO_ID_PATTERN.test(bare) ? bare : null;
}

/**
 * Extract the 11-character YouTube video id from a URL, or null.
 *
 * Supported forms:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://www.youtube.com/watch?v=VIDEO_ID&t=30s
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/shorts/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/live/VIDEO_ID
 *  - http / https schemes, optional www., m. and music. hosts,
 *    youtube-nocookie.com embeds, and any ?si= share-link noise.
 *
 * Deliberately NOT accepted: arbitrary domains, search/list/playlist URLs
 * without a v= parameter, and bare 11-character strings (an id is not a URL).
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  // Reject protocol-relative ("//youtu.be/x") and non-http(s) schemes —
  // both parse successfully but are not usable page URLs.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) return null;

  const pathSegments = parsed.pathname.split("/").filter(Boolean);

  // youtu.be/<id> — the id IS the first path segment.
  if (parsed.hostname.toLowerCase().endsWith("youtu.be")) {
    return extractIdFromSegment(pathSegments[0]);
  }

  // /shorts/<id>, /embed/<id>, /live/<id> — id is the second path segment.
  if (pathSegments.length >= 2 && ["shorts", "embed", "live"].includes(pathSegments[0])) {
    return extractIdFromSegment(pathSegments[1]);
  }

  // /watch?v=<id> (any extra query parameters allowed).
  const v = parsed.searchParams.get("v");
  if (pathSegments[0] === "watch" && v && VIDEO_ID_PATTERN.test(v)) {
    return v;
  }

  return null;
}

/**
 * Normalize a YouTube URL for storage while keeping it a working page link
 * (the admin UI and future embeds both derive from this value):
 * lower-cased scheme/host, no default port, no tracking parameters —
 * only "v" is kept on /watch paths. Returns null for invalid/non-YouTube
 * URLs (same acceptance rules as extractYouTubeVideoId).
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const parsed = new URL(url.trim());
  parsed.protocol = "https:";
  parsed.hash = "";
  parsed.username = "";
  parsed.password = "";

  const keepSearch = parsed.pathname.split("/").filter(Boolean)[0] === "watch";
  parsed.search = keepSearch ? `v=${videoId}` : "";

  // Strip double slashes in the path and any empty trailing segments.
  parsed.pathname = parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";

  return parsed.toString();
}

/** True when the node type stores YouTube video metadata. */
export function isVideoNodeType(type: string): type is "VIDEO" | "LESSON" {
  return type === "VIDEO" || type === "LESSON";
}
