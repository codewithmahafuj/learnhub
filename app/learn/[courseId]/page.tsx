import { notFound } from "next/navigation";
import { LearnWorkspace } from "@/components/lms/learn-workspace";
import { prisma } from "@/lib/prisma";
import {
  buildNodeTree,
  type FlatNodeItem,
} from "@/lib/course-nodes";
import type { CourseNodeData } from "@/components/lms/course-tree";

// Learning must reflect live content, never a cached copy.
export const dynamic = "force-dynamic";

interface LearnPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { courseId } = await params;

  // One scoped query; an unknown id reads as missing → the app's standard
  // not-found screen. The page can never render a course that isn't there.
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, description: true },
  });
  if (!course) {
    notFound();
  }

  // Single query for ALL nodes of THIS course only, ordered deterministically
  // (parentId, sortOrder, createdAt tie-breaker — the same pattern as the
  // admin editor page), then assembled into the nested tree in memory.
  const flatNodes = await prisma.courseNode.findMany({
    where: { courseId: course.id },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      parentId: true,
      // buildNodeTree sorts siblings by this; without it the cast below fails.
      sortOrder: true,
      title: true,
      type: true,
      description: true,
      youtubeUrl: true,
      youtubeVideoId: true,
      // Available for future publishing workflows; no publishing policy is
      // applied here (dev/test courses stay accessible — see report).
      isPublished: true,
    },
  });
  const nodeTree = buildNodeTree(flatNodes as FlatNodeItem[]);
  // Plain serializable objects only — never Prisma model instances — and
  // CourseNodeData's optional fields accept the NodeTreeItem shape.
  const sidebarCurriculum: CourseNodeData[] = nodeTree.map(
    function toNodeData(node): CourseNodeData {
      return {
        id: node.id,
        title: node.title,
        type: node.type,
        description: node.description,
        youtubeUrl: node.youtubeUrl,
        youtubeVideoId: node.youtubeVideoId,
        children: node.children.map(toNodeData),
      };
    }
  );

  return (
    <LearnWorkspace
      courseId={course.id}
      courseTitle={course.title}
      courseDescription={course.description}
      nodes={sidebarCurriculum}
    />
  );
}
