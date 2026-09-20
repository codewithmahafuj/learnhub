import { PageContainer } from "@/components/layout/page-container";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trophy,
  BarChart3,
} from "lucide-react";
import { StatCard } from "@/components/lms/stat-card";
import { CourseCard } from "@/components/lms/course-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function StudentDashboard() {
  const activeCourses = [
    {
      id: "1",
      title: "Advanced React & Next.js Design Patterns",
      category: "Web Development",
      progress: 68,
      totalLessons: 24,
      completedLessons: 16,
      nextLesson: "Server Components & Suspense",
      href: "/courses/nextjs-patterns",
    },
    {
      id: "2",
      title: "UI/UX Design Systems in Figma",
      category: "UI/UX Design",
      progress: 42,
      totalLessons: 18,
      completedLessons: 8,
      nextLesson: "Building Auto-layout Tokens",
      href: "/courses/figma-design-systems",
    },
  ];

  return (
    <PageContainer
      title="Welcome back, Learner! 👋"
      description="Track your learning momentum, jump back into active lessons, or explore new skills."
    >
      <div className="space-y-8">
        {/* Top Analytics / Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            variant="compact"
            title="Enrolled Courses"
            value={4}
            icon={BookOpen}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            variant="compact"
            title="Hours Spent"
            value="28.5 hrs"
            icon={Clock}
            iconClassName="bg-amber-500/10 text-amber-500"
          />
          <StatCard
            variant="compact"
            title="Completed Lessons"
            value={24}
            icon={CheckCircle2}
            iconClassName="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            variant="compact"
            title="Certificates Earned"
            value={2}
            icon={Trophy}
            iconClassName="bg-purple-500/10 text-purple-500"
          />
        </div>

        {/* Quick Access Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">My Enrolled Courses</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Jump directly back to your ongoing courses and continue your learning progress.
              </p>
            </div>
            <Link
              href="/courses"
              className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary transition-all group-hover:translate-x-0.5"
            >
              Go to My Courses <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">Browse Catalog</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Explore tech tracks, design systems, and skill-building modules in our catalog.
              </p>
            </div>
            <Link
              href="/browse"
              className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary transition-all group-hover:translate-x-0.5"
            >
              Explore Catalog <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">Achievements & Certificates</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                View detailed analytics of completed lectures, grades, and earned credentials.
              </p>
            </div>
            <Link
              href="/progress"
              className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary transition-all group-hover:translate-x-0.5"
            >
              View Progress <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Recently Active / In Progress Courses */}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                In Progress
              </h2>
              <p className="text-xs text-muted-foreground">
                Pick up right where you left off.
              </p>
            </div>
            <Link
              href="/courses"
              className="text-xs font-medium text-primary hover:underline self-start sm:self-auto"
            >
              View all ({activeCourses.length})
            </Link>
          </div>

          {activeCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  variant="in-progress"
                  title={course.title}
                  category={course.category}
                  progress={course.progress}
                  totalLessons={course.totalLessons}
                  completedLessons={course.completedLessons}
                  nextLesson={course.nextLesson}
                  href={course.href}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No active course sessions"
              description="You don't have any lessons in progress right now. Browse our catalog to start learning."
              action={
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                >
                  Browse Catalog
                </Link>
              }
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
