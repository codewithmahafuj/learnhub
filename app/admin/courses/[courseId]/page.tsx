import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { BackLink } from "@/components/layout/back-link";
import { CourseHeader } from "@/components/lms/course-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/components/admin/course-form";
import { updateCourseAction } from "./actions";
import { prisma } from "@/lib/prisma";

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

  // Bind the course id server-side; the client never supplies it per request.
  const updateWithId = updateCourseAction.bind(null, course.id);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Back navigation */}
        <div>
          <BackLink href="/admin/courses" label="Back to Course Hub" />
        </div>

        {/* Edit Title Section Banner */}
        <CourseHeader
          badgeText={`Syllabus Manager · ${course.status}`}
          title={course.title}
          description="Construct course syllabus hierarchies, attach lessons, and drag-and-drop course video links."
          action={
            <Button className="w-full md:w-auto h-11 px-6 font-semibold gap-1.5" disabled>
              <PlusCircle className="h-4 w-4" /> Add New Module
            </Button>
          }
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

        {/* Curriculum builder — placeholder until the CourseNode phase */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Curriculum Structure Outline
          </h2>

          <EmptyState
            title="Curriculum tree renderer offline"
            description="Course chapters and learning units can be constructed and ordered recursively here in the future database phase."
            className="p-12 border-dashed"
          />
        </div>
      </div>
    </PageContainer>
  );
}
