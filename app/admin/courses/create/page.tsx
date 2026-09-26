import { PageContainer } from "@/components/layout/page-container";
import { BackLink } from "@/components/layout/back-link";
import { CourseForm } from "@/components/admin/course-form";
import { createCourseAction } from "./actions";

export default function AdminCourseCreate() {
  return (
    <PageContainer>
      <div className="space-y-6 max-w-3xl">
        {/* Back navigation */}
        <div>
          <BackLink href="/admin/courses" label="Back to Courses Hub" />
        </div>

        {/* Page Title section */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Create New Course
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure the descriptive titles, thumbnail endpoints, and catalog classifications.
          </p>
        </div>

        {/* Create Course Form */}
        <div className="border border-border/50 rounded-xl bg-background p-6 space-y-6">
          <CourseForm action={createCourseAction} />
        </div>
      </div>
    </PageContainer>
  );
}
