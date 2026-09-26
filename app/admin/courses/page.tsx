import { PageContainer } from "@/components/layout/page-container";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseTableRow } from "@/components/admin/course-table-row";
import { prisma } from "@/lib/prisma";

// The course list must reflect the live database on every request, not a
// build-time snapshot taken with whatever rows existed during `next build`.
export const dynamic = "force-dynamic";

export default async function AdminCourses() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
    },
  });

  const adminCourses = courses.map((course) => ({
    id: course.id,
    title: course.title,
    // Student-facing URL handle for the course (public browsing arrives in a
    // later step); keeps the row's existing "URL Handle" line meaningful.
    handle: `/courses/${course.slug}`,
    status: course.status,
    editHref: `/admin/courses/${course.id}`,
  }));

  return (
    <PageContainer
      title="Course Hub"
      description="Publish courses, construct lecture structures, and audit educational modules."
    >
      <div className="flex justify-between items-center pb-2">
        <span className="text-sm font-semibold text-muted-foreground">
          Active Modules ({adminCourses.length})
        </span>
        <Link href="/admin/courses/create">
          <Button className="h-9 gap-1.5 font-medium">
            <PlusCircle className="h-4 w-4" /> Add New Course
          </Button>
        </Link>
      </div>

      <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
        <div className="divide-y divide-border/50">
          {adminCourses.map((course) => (
            <CourseTableRow
              key={course.id}
              id={course.id}
              title={course.title}
              handle={course.handle}
              status={course.status}
              editHref={course.editHref}
            />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
