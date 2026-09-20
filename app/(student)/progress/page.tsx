import { PageContainer } from "@/components/layout/page-container";
import { GraduationCap, Award, Clock } from "lucide-react";
import { StatCard } from "@/components/lms/stat-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function StudentProgress() {
  return (
    <PageContainer
      title="My Progress"
      description="Monitor lectures watched, review completed segments, and examine earned certificates."
    >
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          title="Active Hours"
          value="0 hrs"
          description="Total study engagement period"
          icon={Clock}
        />
        <StatCard
          title="Lectures Completed"
          value="0 / 0"
          description="Completed lecture check ratio"
          icon={GraduationCap}
        />
        <StatCard
          title="Certificates Earned"
          value="0"
          description="Official certifications received"
          icon={Award}
        />
      </div>

      {/* Progress placeholder details */}
      <div className="border border-border/50 rounded-xl bg-background p-6 space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Accomplishments & History
        </h2>
        <EmptyState
          title="No completed lessons recorded on this student profile yet."
          className="h-32 p-4 border-dashed border-border/80"
        />
      </div>
    </PageContainer>
  );
}
