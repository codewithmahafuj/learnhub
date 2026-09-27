"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { parseNodeInput } from "@/lib/course-nodes";

/**
 * ADMIN CourseNode management — server actions (Step 6 Part 4).
 *
 * Security model (same as the course CRUD actions):
 * - Every action re-verifies the ADMIN session (defense in depth beyond
 *   proxy.ts) — a Server Action endpoint is independently addressable.
 * - courseId always comes from the bound route segment, NEVER from the client.
 * - parentId/nodeId are validated to belong to the same course before any
 *   mutation, so cross-course manipulation is impossible.
 * - Callers only ever receive { ok } / { error } with safe, user-friendly
 *   strings. Prisma error text, SQL, and connection details never surface.
 */

export interface NodeActionState {
  ok?: boolean;
  error?: string;
}

/** Safe Prisma failure log + generic client-facing message. */
function logAndMessage(scope: string, error: unknown): NodeActionState {
  console.error(
    `[${scope}]`,
    error instanceof Prisma.PrismaClientKnownRequestError
      ? `Prisma error ${error.code}`
      : "unexpected error"
  );
  return { error: "Something went wrong. Please try again." };
}

/** Verify the course exists (and therefore that the route segment is real). */
async function requireCourse(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
}

/** Fetch a node constrained to its course — cross-course ids read as missing. */
function findCourseNode(courseId: string, nodeId: string) {
  return prisma.courseNode.findFirst({
    where: { id: nodeId, courseId },
    select: { id: true },
  });
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createCourseNodeAction(
  courseId: string,
  _prevState: NodeActionState,
  formData: FormData
): Promise<NodeActionState> {
  // ---- 1. Authorization (defense in depth beyond proxy.ts) ----------------
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to modify course content." };
  }

  // ---- 2. Validate input ---------------------------------------------------
  const parsed = parseNodeInput(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { title, type, description } = parsed.values;

  // Optional parentId from the form; root creation sends nothing.
  const rawParentId = String(formData.get("parentId") ?? "").trim();
  const parentId = rawParentId || null;

  try {
    // ---- 3. Verify the course exists --------------------------------------
    const course = await requireCourse(courseId);
    if (!course) {
      return { error: "This course no longer exists." };
    }

    // ---- 4. Parent must exist and belong to the SAME course ---------------
    if (parentId) {
      const parent = await findCourseNode(courseId, parentId);
      if (!parent) {
        // Missing, or belongs to another course — indistinguishable on purpose.
        return { error: "The selected parent item is no longer available." };
      }
    }

    // ---- 5. Append to the end of the sibling list -------------------------
    // Root nodes order among roots; children order among their siblings.
    const lastSibling = await prisma.courseNode.findFirst({
      where: { courseId, parentId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastSibling?.sortOrder ?? -1) + 1;

    await prisma.courseNode.create({
      data: {
        courseId,
        parentId,
        title,
        type,
        description,
        sortOrder: nextSortOrder,
      },
    });
  } catch (error) {
    return logAndMessage("[createCourseNodeAction]", error);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

/**
 * Update an existing node's title/type/description. courseId, parentId,
 * sortOrder, isPublished, and the YouTube fields are intentionally NOT
 * updatable here — they belong to later features.
 */
export async function updateCourseNodeAction(
  courseId: string,
  _prevState: NodeActionState,
  formData: FormData
): Promise<NodeActionState> {
  // ---- 1. Authorization ----------------------------------------------------
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to modify course content." };
  }

  // ---- 2. Validate input ---------------------------------------------------
  const parsed = parseNodeInput(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { title, type, description } = parsed.values;

  const nodeId = String(formData.get("nodeId") ?? "").trim();
  if (!nodeId) {
    return { error: "Invalid course item." };
  }

  try {
    // ---- 3. Node must exist and belong to this course ---------------------
    const node = await findCourseNode(courseId, nodeId);
    if (!node) {
      return { error: "This course item no longer exists." };
    }

    await prisma.courseNode.update({
      where: { id: nodeId },
      data: { title, type, description },
    });
  } catch (error) {
    return logAndMessage("[updateCourseNodeAction]", error);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

/**
 * Permanently delete a node. The existing self-relation cascade removes all
 * descendants (children, grandchildren, …). Idempotent: deleting an
 * already-missing node is a safe success.
 */
export async function deleteCourseNodeAction(
  courseId: string,
  nodeId: string
): Promise<NodeActionState> {
  // ---- 1. Validate ids ------------------------------------------------------
  if (typeof courseId !== "string" || !courseId.trim()) {
    return { error: "Invalid course." };
  }
  if (typeof nodeId !== "string" || !nodeId.trim()) {
    return { error: "Invalid course item." };
  }

  // ---- 2. Authorization ----------------------------------------------------
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "You are not authorized to modify course content." };
  }

  try {
    // ---- 3. Node must exist and belong to this course ---------------------
    const node = await findCourseNode(courseId, nodeId);
    if (!node) {
      // Already deleted (double delete) or never existed / other course.
      revalidatePath(`/admin/courses/${courseId}`);
      return { ok: true };
    }

    await prisma.courseNode.delete({ where: { id: nodeId } });
  } catch (error) {
    const isRecordMissing =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025";
    if (isRecordMissing) {
      // Vanished between the check and the delete — safe success.
      revalidatePath(`/admin/courses/${courseId}`);
      return { ok: true };
    }
    return logAndMessage("[deleteCourseNodeAction]", error);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}
