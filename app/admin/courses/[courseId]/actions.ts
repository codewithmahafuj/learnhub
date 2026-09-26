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
 * ADMIN course editing — server action (Step 6 Part 2).
 *
 * Security model (same as createCourseAction):
 * - Runs exclusively on the server; the client only ever receives the returned
 *   { error } state or the post-save redirect.
 * - Authorization is re-verified here on EVERY invocation (defense in depth):
 *   proxy.ts already gates /admin/*, but a Server Action endpoint is
 *   independently addressable, so the session role must not be assumed.
 * - All input validation is shared with creation via @/lib/courses, so the
 *   rules can never drift between the two flows.
 * - No Prisma error text, SQL, or connection details ever reach the client.
 */

/** True when `slug` is taken by a course OTHER than `excludeCourseId`. */
async function slugTakenByOther(
  slug: string,
  excludeCourseId: string
): Promise<boolean> {
  const existing = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });
  return existing !== null && existing.id !== excludeCourseId;
}

/**
 * Update an existing course. The courseId is bound server-side by the edit
 * page (updateCourseAction.bind(null, course.id)); it is re-validated here
 * because nothing that arrives over the wire should be trusted.
 */
export async function updateCourseAction(
  courseId: string,
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  // ---- 1. Validate the course id ------------------------------------------
  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    return { error: "Invalid course." };
  }

  // ---- 2. Authorization (defense in depth beyond proxy.ts) ----------------
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to edit courses." };
  }

  // ---- 3. Validate input (same rules as creation) -------------------------
  const parsed = parseCourseInput(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { title, description, thumbnailUrl } = parsed.values;

  // ---- 4. Load the current course -----------------------------------------
  // Needed to decide the slug policy (title changed vs unchanged) and to
  // handle the course being deleted while the form was open.
  let existing: { id: string; title: string; slug: string } | null;
  try {
    existing = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, slug: true },
    });
  } catch (error) {
    console.error(
      "[updateCourseAction] course lookup failed:",
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Prisma error ${error.code}`
        : "unexpected error"
    );
    return {
      error: "Something went wrong while saving the course. Please try again.",
    };
  }

  if (!existing) {
    // Deleted while the form was open — safe message, no DB internals leak.
    return { error: "This course no longer exists." };
  }

  // ---- 5. Slug policy ------------------------------------------------------
  // - Title unchanged → keep the existing slug EXACTLY (editing only the
  //   description must never churn the URL).
  // - Title changed → new slug from the new title, unique among OTHER courses
  //   (self-collisions excluded: a course may keep its own slug).
  // - The update retries on P2002 so a concurrent create/edit that races past
  //   the check still resolves safely against the DB unique constraint.
  const baseSlug = buildSlugFromTitle(title);
  if (!baseSlug) {
    return { error: "Could not generate a valid URL slug from this title." };
  }

  const titleUnchanged = title === existing.title.trim();
  let targetSlug = existing.slug;

  if (!titleUnchanged) {
    let resolved = false;
    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS && !resolved; attempt++) {
      const candidate = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
      if (!(await slugTakenByOther(candidate, courseId))) {
        targetSlug = candidate;
        resolved = true;
      }
    }
    if (!resolved) {
      return {
        error:
          "Could not generate a unique URL slug. Please try a different title.",
      };
    }
  }

  // ---- 6. Update ------------------------------------------------------------
  // status and categoryId are intentionally NOT in the payload — they are
  // preserved exactly as stored (no accidental DRAFT reset, no category
  // removal). updatedAt is maintained by Prisma's @updatedAt.
  try {
    let updated = false;
    for (
      let attempt = 1;
      attempt <= MAX_SLUG_ATTEMPTS && !updated;
      attempt++
    ) {
      const slug = attempt === 1 ? targetSlug : `${targetSlug}-${attempt}`;
      try {
        await prisma.course.update({
          where: { id: courseId },
          data: {
            title,
            slug,
            description: description || null,
            thumbnailUrl,
          },
          select: { id: true },
        });
        updated = true;
      } catch (error) {
        const isSlugCollision =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002";
        if (!isSlugCollision) throw error;
        // Raced with a concurrent create/edit → shift the -N suffix, retry.
      }
    }
    if (!updated) {
      return {
        error:
          "Could not generate a unique URL slug. Please try a different title.",
      };
    }
  } catch (error) {
    console.error(
      "[updateCourseAction] course update failed:",
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Prisma error ${error.code}`
        : "unexpected error"
    );
    return {
      error: "Something went wrong while saving the course. Please try again.",
    };
  }

  // ---- 7. Redirect only after a successful save ----------------------------
  redirect("/admin/courses");
}
