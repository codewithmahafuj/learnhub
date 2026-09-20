import { PageContainer } from "@/components/layout/page-container";

export default function StudentSettings() {
  return (
    <PageContainer
      title="Settings"
      description="Manage your account preferences, password credentials, and dashboard behaviors."
    >
      <div className="border border-border/50 rounded-xl bg-background p-6 max-w-2xl space-y-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Account Configurations
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
            <div>
              <p className="text-sm font-semibold">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive weekly lecture summaries and active discussion alerts.</p>
            </div>
            <div className="w-9 h-5 bg-muted rounded-full relative cursor-not-allowed">
              <div className="w-4 h-4 bg-background rounded-full absolute top-0.5 left-0.5 shadow-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
            <div>
              <p className="text-sm font-semibold">Platform Theme</p>
              <p className="text-xs text-muted-foreground">Toggle between Light mode, Dark mode, or system default colors.</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              System
            </span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
