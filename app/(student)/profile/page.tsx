import { PageContainer } from "@/components/layout/page-container";
import { ProfileForm } from "./profile-form";

export default function StudentProfile() {
  return (
    <PageContainer
      title="My Profile"
      description="Update your personal details, profile avatar representation, and public credentials."
    >
      <div className="border border-border/50 rounded-xl bg-background p-6 max-w-2xl space-y-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Profile Settings
        </h2>
        <ProfileForm />
      </div>
    </PageContainer>
  );
}

