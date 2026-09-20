import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminEnrollments() {
  return (
    <PageContainer
      title="Enrollments Manager"
      description="Verify active course registrations, audit enrollment seats, and oversee course claims."
    >
      <div className="border border-border/50 rounded-xl bg-background p-6 space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Platform Enrollments
        </h2>
        <EmptyState
          title="No active student enrollments logged on this platform yet."
          className="h-32 p-4 border-dashed border-border/80"
        />
      </div>
    </PageContainer>
  );
}
