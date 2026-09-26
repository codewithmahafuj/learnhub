"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

import {
  buildSlugFromTitle,
  MAX_SLUG_ATTEMPTS,
  parseCourseInput,
  type CourseFormState,
} from "@/lib/courses";

/**
 * ADMIN course creation — server action (Step 6 Part 1).
 *
 * Security model:
 * - Runs exclusively on the server; the client only ever receives the returned
 *   { error } state or the post-creation redirect.
 * - "use server" files may only export async functions (type-only exports are
 *   erased at build time and are fine).
 * - Authorization is re-verified here on EVERY invocation (defense in depth):
 *   proxy.ts already gates the /admin/* routes, but a Server Action endpoint is
 *   independently addressable, so the session role must not be assumed.
 * - Callers only ever receive short, safe, user-friendly strings. Prisma error
 *   text, SQL, and connection details are never returned to the client.
 */

/** Create the Course row. Always DRAFT — publishing is a later step. */
function createDraftCourse(title: string, slug: string, description: string, thumbnailUrl: string | null) {
  return prisma.course.create({
    data: {
      title,
      slug,
      description: description || null,
      thumbnailUrl,
      // Creation always yields a DRAFT course, regardless of form content.
      status: "DRAFT",
      // categoryId stays null: the form's category select is a UI placeholder
      // until category management ships in a later step.
      categoryId: null,
    },
    select: { id: true, slug: true },
  });
}

export async function createCourseAction(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  // ---- 1. Authorization (defense in depth beyond proxy.ts) ----------------
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to create courses." };
  }

  // ---- 2. Validate input (server-side only; never trust the client) -------
  const parsed = parseCourseInput(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { title, description, thumbnailUrl } = parsed.values;

  // ---- 3. Generate a unique slug server-side ------------------------------
  // The slug is derived ONLY from the title — any client-supplied slug is
  // ignored. Collisions are resolved with -2, -3, … suffixes. The insert is
  // retried on Prisma P2002 (unique violation) so a concurrent creation that
  // races past the check still resolves safely against the DB constraint.
  const baseSlug = buildSlugFromTitle(title);
  if (!baseSlug) {
    // Title passed validation but slugified to nothing (e.g. only symbols) —
    // surface a form error instead of crashing.
    return {
      error: "Could not generate a valid URL slug from this title.",
    };
  }

  // Bounded loop: MAX_SLUG_ATTEMPTS is far beyond any realistic collision
  // chain, so a pathological dataset cannot spin this forever. Attempt 1 uses
  // the bare slug; attempts 2+ append the -N suffix. A non-collision failure
  // returns immediately; otherwise the loop ends with the course created.
  let created = false;
  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS && !created; attempt++) {
    const slug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    try {
      await createDraftCourse(title, slug, description, thumbnailUrl);
      created = true;
    } catch (error) {
      const isSlugCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!isSlugCollision) {
        // Database failure → safe, generic message. Only a coarse error code
        // is logged — never query text, connection strings, or secrets.
        console.error(
          "[createCourseAction] course creation failed:",
          error instanceof Prisma.PrismaClientKnownRequestError
            ? `Prisma error ${error.code}`
            : "unexpected error"
        );
        return {
          error:
            "Something went wrong while creating the course. Please try again.",
        };
      }
      // Slug collision (from a concurrent create racing past the unique
      // constraint) → retry with the next -N suffix.
    }
  }

  if (!created) {
    return {
      error: "Could not generate a unique URL slug. Please try a different title.",
    };
  }

  // ---- 4. Redirect only after successful creation -------------------------
  redirect("/admin/courses");
}
