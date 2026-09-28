/**
 * Shared CourseNode helpers (Step 6 Parts 4 & 6).
 *
 * Deliberately PURE — no Prisma, no server-only imports — so both the server
 * actions and client components can share the exact same validation rules and
 * tree types. Database-facing cascade handling stays in the actions.
 */

import { extractYouTubeVideoId, normalizeYouTubeUrl } from "@/lib/youtube";

/** CourseNode title: required, trimmed, bounded length. */
export const MIN_NODE_TITLE_LENGTH = 2;
export const MAX_NODE_TITLE_LENGTH = 150;
/** CourseNode description: optional, trimmed, bounded length. */
export const MAX_NODE_DESCRIPTION_LENGTH = 1000;

/** The existing Prisma enum values, mirrored as a plain const for validation. */
export const COURSE_NODE_TYPES = [
  "MILESTONE",
  "MODULE",
  "CHAPTER",
  "SECTION",
  "LESSON",
  "VIDEO",
  "ARTICLE",
  "ASSIGNMENT",
] as const;

export type CourseNodeTypeValue = (typeof COURSE_NODE_TYPES)[number];

/**
 * Validated, trimmed node input. `parentId` null = root node.
 *
 * `youtubeUrl` is the normalized URL the admin submitted (or null) and
 * `youtubeVideoId` is ALWAYS derived server-side from it — never trusted
 * from the client. Both are null for non-video node types and whenever no
 * (valid) URL is supplied (Step 6 Part 6).
 */
export interface NodeFormValues {
  title: string;
  type: CourseNodeTypeValue;
  description: string | null;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
}

/**
 * Serializable node shape shared by server actions and client components.
 * Client components receive exactly this — never a Prisma object.
 */
export interface NodeTreeItem {
  id: string;
  title: string;
  type: string;
  description: string | null;
  /** Normalized YouTube URL (Step 6 Part 6) — null when absent. */
  youtubeUrl: string | null;
  /** ALWAYS derived server-side from youtubeUrl — never client-supplied. */
  youtubeVideoId: string | null;
  children: NodeTreeItem[];
}

/** Flat node row as read from the database (order preserved by caller). */
export interface FlatNodeItem {
  id: string;
  parentId: string | null;
  title: string;
  type: string;
  description: string | null;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  sortOrder: number;
}

/**
 * Build the nested node tree from flat rows.
 *
 * Pure recursion over parentId — roots are rows with `parentId === null`,
 * children are grouped under their parent, siblings keep the caller's order
 * (pass rows sorted by sortOrder ASC). Depth is unlimited by construction;
 * orphaned rows (parent missing/other course) are ignored defensively.
 */
export function buildNodeTree(flat: FlatNodeItem[]): NodeTreeItem[] {
  const byId = new Map<string, NodeTreeItem>();
  for (const row of flat) {
    byId.set(row.id, {
      id: row.id,
      title: row.title,
      type: row.type,
      description: row.description,
      youtubeUrl: row.youtubeUrl ?? null,
      youtubeVideoId: row.youtubeVideoId ?? null,
      children: [],
    });
  }

  const roots: NodeTreeItem[] = [];
  for (const row of flat) {
    const item = byId.get(row.id);
    if (!item) continue;
    const parent = row.parentId ? byId.get(row.parentId) : undefined;
    if (parent) {
      parent.children.push(item);
    } else if (row.parentId === null) {
      roots.push(item);
    }
    // Rows whose parentId points at a missing/foreign node are dropped.
  }
  return roots;
}

/**
 * Read + validate the shared node form fields from FormData.
 *
 * Server-side only in effect (the actions call this) but pure by design.
 * Returns either the trimmed values or a single safe, user-facing error.
 * Never throws.
 */
export function parseNodeInput(formData: FormData): { ok: true; values: NodeFormValues } | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const typeInput = String(formData.get("type") ?? "").trim().toUpperCase();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (title.length < MIN_NODE_TITLE_LENGTH) {
    return { ok: false, error: `Title must be at least ${MIN_NODE_TITLE_LENGTH} characters.` };
  }
  if (title.length > MAX_NODE_TITLE_LENGTH) {
    return { ok: false, error: `Title must be at most ${MAX_NODE_TITLE_LENGTH} characters.` };
  }

  const isKnownType = COURSE_NODE_TYPES.some((t) => t === typeInput);
  if (!isKnownType) {
    return { ok: false, error: "Please choose a valid item type." };
  }

  if (description.length > MAX_NODE_DESCRIPTION_LENGTH) {
    return { ok: false, error: `Description must be at most ${MAX_NODE_DESCRIPTION_LENGTH} characters.` };
  }

  // ---- YouTube URL (Step 6 Part 6) -----------------------------------------
  // Optional for every node type; validated + normalized whenever supplied.
  // The video id is derived here, server-side — the client never submits one.
  const rawYouTubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  let youtubeUrl: string | null = null;
  let youtubeVideoId: string | null = null;
  if (rawYouTubeUrl) {
    const videoId = extractYouTubeVideoId(rawYouTubeUrl);
    if (!videoId) {
      return { ok: false, error: "Please enter a valid YouTube video URL." };
    }
    youtubeUrl = normalizeYouTubeUrl(rawYouTubeUrl);
    youtubeVideoId = videoId;
  }

  return {
    ok: true,
    values: {
      title,
      type: typeInput as CourseNodeTypeValue,
      description: description || null,
      youtubeUrl,
      youtubeVideoId,
    },
  };
}
