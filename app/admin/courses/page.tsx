import { PageContainer } from "@/components/layout/page-container";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseTableRow } from "@/components/admin/course-table-row";

export default function AdminCourses() {
  const adminCourses = [
    {
      id: "web-dev",
      title: "Professional Web Development",
      handle: "/courses/web-dev",
      status: "Published",
      editHref: "/admin/courses/web-dev",
    },
    {
      id: "nextjs-architecture",
      title: "Next.js Senior Architecture",
      handle: "/courses/nextjs-architecture",
      status: "Published",
      editHref: "/admin/courses/nextjs-architecture",
    },
  ];

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
