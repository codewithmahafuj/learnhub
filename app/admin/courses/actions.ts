"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

/**
 * ADMIN course deletion — server action (Step 6 Part 3).
 *
 * Security model (same as the create/edit actions):
 * - Runs exclusively on the server; the client only ever receives the returned
 *   { ok, error } state.
 * - Authorization is re-verified here on EVERY invocation (defense in depth):
 *   proxy.ts already gates /admin/*, but a Server Action endpoint is
 *   independently addressable, so the session role must not be assumed.
 * - No Prisma error text, SQL, or connection details ever reach the client.
 *
 * Idempotency: deleting a course that has already vanished (double submit, or
 * a concurrent admin deletion) is treated as success — the caller's desired
 * end state ("course is gone") holds either way.
 */

export interface CourseDeleteState {
  ok?: boolean;
  error?: string;
}

/**
 * Permanently delete a course by id. Related CourseNode and Enrollment rows
 * are removed by the existing database cascade rules; the Course's category
 * link is severed with SetNull (the category itself is kept).
 */
export async function deleteCourseAction(
  courseId: string
): Promise<CourseDeleteState> {
  // ---- 1. Validate the course id ------------------------------------------
  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    return { error: "Invalid course." };
  }

  // ---- 2. Authorization (defense in depth beyond proxy.ts) ----------------
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to delete courses." };
  }

  // ---- 3. Verify the course exists, then delete it -------------------------
  try {
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!existing) {
      // Already deleted (double submit / raced with another admin).
      revalidatePath("/admin/courses");
      return { ok: true };
    }

    await prisma.course.delete({ where: { id: courseId } });
  } catch (error) {
    // P2025 = "record to delete does not exist" — the course vanished between
    // the existence check and the delete (or was never there): safe success.
    const isRecordMissing =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025";
    if (isRecordMissing) {
      revalidatePath("/admin/courses");
      return { ok: true };
    }
    console.error(
      "[deleteCourseAction] course deletion failed:",
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Prisma error ${error.code}`
        : "unexpected error"
    );
    return {
      error: "Something went wrong while deleting the course. Please try again.",
    };
  }

  // ---- 4. Refresh the list so the row disappears immediately ----------------
  revalidatePath("/admin/courses");
  return { ok: true };
}
