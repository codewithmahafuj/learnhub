"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

/**
 * State returned to the client by the publish/unpublish actions.
 * Type-only export (erased at build time — "use server" files may only
 * export async functions).
 */
export type PublishActionState = {
  error?: string;
  success?: string;
};

/**
 * ADMIN course publishing — server actions (Step 6 Part 9).
 *
 * Publishing is an EXPLICIT, separate step: creating a course always yields a
 * DRAFT (createCourseAction), and editing details (updateCourseAction) never
 * touches status. These actions are the only mutation paths to PUBLISHED or
 * back to DRAFT (unpublish), so the workflow stays auditable and reversible.
 *
 * Security model (identical to the create/edit actions):
 * - Server actions are independently addressable endpoints, so the ADMIN role
 *   is re-verified here on every invocation (proxy.ts is not sufficient).
 * - The courseId comes from the bound server component, but it is re-validated
 *   anyway — nothing that arrives over the wire is trusted.
 * - Clients only ever receive short, safe strings. Prisma error text, SQL, and
 *   connection details never reach the browser (only a coarse error code is
 *   logged server-side).
 */

/** Cuid-like ids are opaque; enforce a sane bound before touching the DB. */
function isPlausibleCourseId(courseId: unknown): courseId is string {
  return typeof courseId === "string" && courseId.trim().length > 0 && courseId.length <= 64;
}

/** The course fields that must exist before a course can go public. */
function validatePublishableCourse(course: {
  title: string;
  description: string | null;
}): string | null {
  if (!course.title.trim()) {
    return "A course title is required before publishing.";
  }
  if (!course.description || !course.description.trim()) {
    return "A course description is required before publishing.";
  }
  return null;
}

/**
 * Publish a course (status DRAFT|ARCHIVED → PUBLISHED).
 *
 * Validation happens BEFORE the status change: a course missing required
 * public information is never flipped to PUBLISHED. Idempotent — publishing
 * an already-published course is a successful no-op that just reports the
 * current state (safe against double-clicks and stale buttons).
 */
export async function publishCourseAction(
  courseId: string,
  _prevState: PublishActionState,
  formData: FormData
): Promise<PublishActionState> {
  // ---- 1. Validate the course id ------------------------------------------
  // The bound id wins; the hidden form field is an explicit fallback. Either
  // way the id is re-validated against the database below, so a tampered
  // value can only ever produce "course not found".
  const targetId = isPlausibleCourseId(courseId)
    ? courseId.trim()
    : typeof formData.get("courseId") === "string"
      ? (formData.get("courseId") as string).trim().slice(0, 64)
      : "";
  if (!targetId) {
    return { error: "Invalid course." };
  }

  // ---- 2. Authorization (defense in depth beyond proxy.ts) ----------------
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to publish courses." };
  }

  // ---- 3. Load the course ---------------------------------------------------
  let course: { id: string; status: string; title: string; description: string | null } | null;
  try {
    course = await prisma.course.findUnique({
      where: { id: targetId },
      select: { id: true, status: true, title: true, description: true },
    });
  } catch (error) {
    console.error(
      "[publishCourseAction] course lookup failed:",
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Prisma error ${error.code}`
        : "unexpected error"
    );
    return { error: "Something went wrong while publishing the course. Please try again." };
  }

  if (!course) {
    // Deleted (or id fabricated) — safe message, no DB internals exposed.
    return { error: "This course no longer exists." };
  }

  // ---- 4. Required course information (checked BEFORE flipping status) ----
  const validationError = validatePublishableCourse(course);
  if (validationError) {
    return { error: validationError };
  }

  // ---- 5. Publish (idempotent) ----------------------------------------------
  if (course.status !== "PUBLISHED") {
    try {
      await prisma.course.update({
        where: { id: targetId },
        data: { status: "PUBLISHED" },
        select: { id: true },
      });
    } catch (error) {
      console.error(
        "[publishCourseAction] status update failed:",
        error instanceof Prisma.PrismaClientKnownRequestError
          ? `Prisma error ${error.code}`
          : "unexpected error"
      );
      return { error: "Something went wrong while publishing the course. Please try again." };
    }
  }

  // ---- 6. Revalidate the affected public + admin surfaces -------------------
  revalidatePath("/browse");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${targetId}`);

  return { success: "Course published. It is now visible in the public catalog." };
}

/**
 * Unpublish a course (PUBLISHED → DRAFT), immediately removing it from the
 * public catalog while keeping all content intact for later re-publishing.
 * Idempotent in the same way as publish: unpublishing a DRAFT is a no-op.
 */
export async function unpublishCourseAction(
  courseId: string,
  _prevState: PublishActionState,
  formData: FormData
): Promise<PublishActionState> {
  // Same id policy as publishCourseAction: bound id wins, hidden field is the
  // explicit fallback, and the database lookup re-validates either way.
  const targetId = isPlausibleCourseId(courseId)
    ? courseId.trim()
    : typeof formData.get("courseId") === "string"
      ? (formData.get("courseId") as string).trim().slice(0, 64)
      : "";
  if (!targetId) {
    return { error: "Invalid course." };
  }

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to unpublish courses." };
  }

  let course: { id: string; status: string } | null;
  try {
    course = await prisma.course.findUnique({
      where: { id: targetId },
      select: { id: true, status: true },
    });
  } catch (error) {
    console.error(
      "[unpublishCourseAction] course lookup failed:",
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Prisma error ${error.code}`
        : "unexpected error"
    );
    return { error: "Something went wrong while unpublishing the course. Please try again." };
  }

  if (!course) {
    return { error: "This course no longer exists." };
  }

  if (course.status !== "DRAFT") {
    try {
      await prisma.course.update({
        where: { id: targetId },
        data: { status: "DRAFT" },
        select: { id: true },
      });
    } catch (error) {
      console.error(
        "[unpublishCourseAction] status update failed:",
        error instanceof Prisma.PrismaClientKnownRequestError
          ? `Prisma error ${error.code}`
          : "unexpected error"
      );
      return { error: "Something went wrong while unpublishing the course. Please try again." };
    }
  }

  revalidatePath("/browse");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${targetId}`);

  return { success: "Course unpublished. It is no longer visible in the public catalog." };
}
