import { PageContainer } from "@/components/layout/page-container";
import { CourseCard } from "@/components/lms/course-card";

export default function StudentCourses() {
  const enrolledCourses = [
    {
      id: "web-dev",
      title: "Professional Web Development",
      description:
        "Learn HTML, CSS, JavaScript, React, and modern Next.js framework from scratch to build fully responsive modern web applications.",
      progress: 0,
      href: "/courses/web-dev",
    },
    {
      id: "nextjs-architecture",
      title: "Next.js Senior Architecture",
      description:
        "Advanced course covering routing, hydration, state management, Prisma, dynamic caching, and performance scaling in corporate software systems.",
      progress: 0,
      href: "/courses/nextjs-architecture",
    },
  ];

  return (
    <PageContainer
      title="My Courses"
      description="Access and resume lectures for all the courses you have enrolled in."
    >
      <div className="border border-border/50 rounded-xl bg-background p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Enrolled Courses
            </h2>
            <p className="text-xs text-muted-foreground">
              A list of courses registered to your student profile.
            </p>
          </div>
        </div>

        {/* Course Card Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {enrolledCourses.map((course) => (
            <CourseCard
              key={course.id}
              variant="enrolled"
              title={course.title}
              description={course.description}
              progress={course.progress}
              href={course.href}
            />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
