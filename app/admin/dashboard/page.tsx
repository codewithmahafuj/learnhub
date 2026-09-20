import { PageContainer } from "@/components/layout/page-container";
import Link from "next/link";
import { BookOpen, Users, ClipboardList, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/lms/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminDashboard() {
  return (
    <PageContainer
      title="Admin Dashboard"
      description="Overview of course offerings, student enrollment logs, and platform operations."
    >
      <div className="flex justify-end pb-2">
        <Link href="/admin/courses/create">
          <Button className="h-9 gap-1.5 font-medium">
            <PlusCircle className="h-4 w-4" /> Create Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Courses"
          value={2}
          description="Active syllabus curriculums published"
          icon={BookOpen}
          href="/admin/courses"
          actionLabel="Manage Courses"
        />
        <StatCard
          title="Registered Students"
          value={0}
          description="Students registered in system records"
          icon={Users}
          href="/admin/students"
          actionLabel="View Student Registry"
        />
        <StatCard
          title="Active Enrollments"
          value={0}
          description="Course enrolment seats claimed"
          icon={ClipboardList}
          href="/admin/enrollments"
          actionLabel="Review Enrollments"
        />
      </div>

      {/* Empty system log placeholder */}
      <div className="border border-border/50 rounded-xl bg-background p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Platform Security Audit & Actions
          </h2>
          <p className="text-xs text-muted-foreground">
            Recent administrative modifications made across the LMS database.
          </p>
        </div>
        <EmptyState
          title="No recent operational logs captured in the audit trail."
          className="h-32 p-4 border-dashed border-border/80"
        />
      </div>
    </PageContainer>
  );
}
