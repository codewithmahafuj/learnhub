import { PageContainer } from "@/components/layout/page-container";
import { BackLink } from "@/components/layout/back-link";
import { CourseHeader } from "@/components/lms/course-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseEditProps {
  params: Promise<{ courseId: string }>;
}

export default async function AdminCourseEdit({ params }: CourseEditProps) {
  const { courseId } = await params;

  // Format the ID for display
  const title = courseId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Back navigation */}
        <div>
          <BackLink href="/admin/courses" label="Back to Course Hub" />
        </div>

        {/* Edit Title Section Banner */}
        <CourseHeader
          badgeText="Syllabus Manager"
          title={title}
          description="Construct course syllabus hierarchies, attach lessons, and drag-and-drop course video links."
          action={
            <Button className="w-full md:w-auto h-11 px-6 font-semibold gap-1.5" disabled>
              <PlusCircle className="h-4 w-4" /> Add New Module
            </Button>
          }
        />

        {/* Mock curriculum builder */}
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
