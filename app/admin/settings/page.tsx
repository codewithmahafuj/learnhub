import { PageContainer } from "@/components/layout/page-container";

export default function AdminSettings() {
  return (
    <PageContainer
      title="Platform Settings"
      description="Manage overall site options, system variables, and role permissions."
    >
      <div className="border border-border/50 rounded-xl bg-background p-6 max-w-2xl space-y-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Global Configurations
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
            <div>
              <p className="text-sm font-semibold">Self-Enrollment</p>
              <p className="text-xs text-muted-foreground">Allow students to instantly self-enroll in published courses.</p>
            </div>
            <div className="w-9 h-5 bg-muted rounded-full relative cursor-not-allowed">
              <div className="w-4 h-4 bg-background rounded-full absolute top-0.5 left-0.5 shadow-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
            <div>
              <p className="text-sm font-semibold">System Audit Logging</p>
              <p className="text-xs text-muted-foreground">Keep administrative operational logs cached for the last 90 days.</p>
            </div>
            <div className="w-9 h-5 bg-muted rounded-full relative cursor-not-allowed">
              <div className="w-4 h-4 bg-background rounded-full absolute top-0.5 left-0.5 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
