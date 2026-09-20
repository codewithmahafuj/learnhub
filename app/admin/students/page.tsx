import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminStudents() {
  return (
    <PageContainer
      title="Student Registry"
      description="View, register, and audit students on the LMS platform."
    >
      <div className="border border-border/50 rounded-xl bg-background p-6 space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Platform Students
        </h2>
        <EmptyState
          title="No student accounts registered in system database records."
          className="h-32 p-4 border-dashed border-border/80"
        />
      </div>
    </PageContainer>
  );
}
