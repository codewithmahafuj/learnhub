/**
 * Shared course input helpers (Step 6 Parts 1 & 2).
 *
 * Deliberately PURE — no Prisma, no server-only imports — so both the create
 * and edit server actions can share the exact same validation rules, and the
 * client form can import the shared state type without pulling server code.
 * Database-facing collision handling stays in the action files.
 */

/** Course title: required, trimmed, bounded length. */
export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 120;
/** Description: optional, trimmed, bounded length. */
export const MAX_DESCRIPTION_LENGTH = 2000;
/** Thumbnail URL: optional, trimmed, bounded length. */
export const MAX_THUMBNAIL_URL_LENGTH = 500;
/** Upper bound for the -2, -3, … slug collision suffix chain. */
export const MAX_SLUG_ATTEMPTS = 200;

/** Client form state shared by create + edit actions. */
export interface CourseFormState {
  error?: string;
}

/** Validated, trimmed course input. */
export interface CourseFormValues {
  title: string;
  description: string;
  thumbnailUrl: string | null;
}

/**
 * Normalize a course title into a URL slug:
 * lowercase, spaces → hyphens, strip unsupported punctuation, collapse
 * repeated hyphens, trim leading/trailing hyphens. No external slug library.
 */
export function buildSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    // strip combining diacritics (é → e) so slugs stay ASCII-safe
    .replace(/[\u0300-\u036f]/g, "")
    // drop everything that is not a letter, digit, whitespace, or hyphen
    .replace(/[^a-z0-9\s-]/g, "")
    // collapse all whitespace runs (spaces, tabs, newlines) to a single hyphen
    .replace(/\s+/g, "-")
    // collapse repeated hyphens (also fills gaps left by dropped punctuation)
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Read + validate the shared course form fields from FormData.
 *
 * Server-side only in effect (the actions call this) but pure by design.
 * Returns either the trimmed values (empty optional strings → null) or a
 * single safe, user-facing error message. Never throws.
 */
export function parseCourseInput(
  formData: FormData
): { ok: true; values: CourseFormValues } | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrlInput = String(formData.get("thumbnailUrl") ?? "").trim();

  if (!title) {
    return { ok: false, error: "Course title is required." };
  }
  if (title.length < MIN_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Course title must be at least ${MIN_TITLE_LENGTH} characters.`,
    };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Course title must be at most ${MAX_TITLE_LENGTH} characters.`,
    };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `Course description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
    };
  }

  if (thumbnailUrlInput.length > MAX_THUMBNAIL_URL_LENGTH) {
    return {
      ok: false,
      error: `Thumbnail URL must be at most ${MAX_THUMBNAIL_URL_LENGTH} characters.`,
    };
  }
  // Optional field: must be a real http(s) URL when provided; empty → null.
  if (thumbnailUrlInput) {
    try {
      const parsed = new URL(thumbnailUrlInput);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return {
          ok: false,
          error: "Thumbnail URL must be a valid http:// or https:// URL.",
        };
      }
    } catch {
      return {
        ok: false,
        error: "Thumbnail URL must be a valid http:// or https:// URL.",
      };
    }
  }

  return {
    ok: true,
    values: {
      title,
      description,
      thumbnailUrl: thumbnailUrlInput || null,
    },
  };
}
