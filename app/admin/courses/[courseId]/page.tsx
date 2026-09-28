import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { CourseHeader } from "@/components/lms/course-header";
import { CourseForm } from "@/components/admin/course-form";
import { CourseStructureEditor } from "@/components/admin/course-structure-editor";
import { PublishPanel } from "@/components/admin/publish-panel";
import { updateCourseAction } from "./actions";
import { publishCourseAction, unpublishCourseAction } from "./publish-actions";
import {
  createCourseNodeAction,
  updateCourseNodeAction,
  deleteCourseNodeAction,
  reorderCourseNodeAction,
} from "./nodes/actions";
import { prisma } from "@/lib/prisma";
import { buildNodeTree, type FlatNodeItem } from "@/lib/course-nodes";

// Editing must always reflect the live database record, never a cached copy.
export const dynamic = "force-dynamic";

interface CourseEditProps {
  params: Promise<{ courseId: string }>;
}

export default async function AdminCourseEdit({ params }: CourseEditProps) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      status: true,
      categoryId: true,
      createdAt: true,
    },
  });

  // Unknown id → the application's standard not-found screen. No database
  // internals are exposed.
  if (!course) {
    notFound();
  }

  // Load the full node list once and assemble the tree server-side.
  // Sorting: roots and siblings both by sortOrder ASC (stable recursion).
  const flatNodes = await prisma.courseNode.findMany({
    where: { courseId: course.id },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      parentId: true,
      title: true,
      type: true,
      description: true,
      // Step 6 Part 6: needed to pre-fill the admin YouTube field.
      youtubeUrl: true,
      youtubeVideoId: true,
      sortOrder: true,
    },
  });
  const nodeTree = buildNodeTree(flatNodes as FlatNodeItem[]);

  // Bind the course id server-side; the client never supplies it per request.
  const updateWithId = updateCourseAction.bind(null, course.id);
  // Publish workflow (Step 6 Part 9): same server-side binding pattern as the
  // details form — the client can only invoke, never alter, the course id.
  const publishWithId = publishCourseAction.bind(null, course.id);
  const unpublishWithId = unpublishCourseAction.bind(null, course.id);
  const createNodeWithCourse = createCourseNodeAction.bind(null, course.id);
  const updateNodeWithCourse = updateCourseNodeAction.bind(null, course.id);
  const deleteNodeWithCourse = deleteCourseNodeAction.bind(null, course.id);
  const reorderNodeWithCourse = reorderCourseNodeAction.bind(
    null,
    course.id
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Breadcrumb — Course Hub → the course itself (never the opaque id) */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
          >
            <ArrowLeft className="h-3 w-3" /> Course Hub
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" aria-hidden />
          <span
            className="truncate max-w-[14rem] md:max-w-sm font-medium text-foreground/80"
            title={course.title}
          >
            {course.title}
          </span>
        </nav>

        {/* Edit Title Section Banner — status lives in the publish panel below */}
        <CourseHeader
          title={course.title}
          description="Construct course syllabus hierarchies, attach lessons, and drag-and-drop course video links."
        />

        {/* Publish workflow — explicit status control, independent of the details form */}
        <PublishPanel
          courseId={course.id}
          status={course.status}
          publishAction={publishWithId}
          unpublishAction={unpublishWithId}
        />

        {/* Course details — shared form with the create flow, pre-filled */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Course Details
          </h2>
          <div className="border border-border/50 rounded-xl bg-background p-6 space-y-6">
            <CourseForm
              action={updateWithId}
              initialTitle={course.title}
              initialDescription={course.description ?? ""}
              initialThumbnailUrl={course.thumbnailUrl ?? ""}
              submitLabel="Save Changes"
            />
          </div>
        </div>

        {/* Course Structure — recursive CourseNode editor with drag-and-drop reordering */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Course Structure
          </h2>
          <CourseStructureEditor
            nodes={nodeTree}
            createAction={createNodeWithCourse}
            updateAction={updateNodeWithCourse}
            deleteAction={deleteNodeWithCourse}
            reorderAction={reorderNodeWithCourse}
          />
        </div>
      </div>
    </PageContainer>
  );
}
