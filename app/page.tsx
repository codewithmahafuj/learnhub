import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-background border border-border/50 rounded-xl shadow-xs p-8 space-y-8 text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-sm">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              LearnHub Platform Shell
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Frontend application shell constructed with Next.js, React 19, Tailwind CSS v4, and shadcn/ui.
            </p>
          </div>
        </div>

        {/* Portal Entry Links */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {/* Student */}
          <div className="border border-border/60 rounded-xl p-5 flex flex-col justify-between text-left hover:border-border transition-colors">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-base flex items-center gap-1.5 text-foreground">
                <GraduationCap className="h-4.5 w-4.5 text-primary" /> Student Portal
              </h3>
              <p className="text-xs text-muted-foreground">
                Dashboard, registered course lists, catalog browser, progress achievements, profile, and settings.
              </p>
            </div>
            <Link href="/dashboard" className="mt-6 w-full">
              <Button className="w-full h-9 text-xs font-semibold gap-1">
                Enter Student <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Admin */}
          <div className="border border-border/60 rounded-xl p-5 flex flex-col justify-between text-left hover:border-border transition-colors">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-base flex items-center gap-1.5 text-foreground">
                <ShieldAlert className="h-4.5 w-4.5 text-primary" /> Admin Portal
              </h3>
              <p className="text-xs text-muted-foreground">
                Operational analytics, course curriculum designer, student lists, enrollments manager, and site configuration.
              </p>
            </div>
            <Link href="/admin/dashboard" className="mt-6 w-full">
              <Button variant="outline" className="w-full h-9 text-xs font-semibold gap-1">
                Enter Admin <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Info footer */}
        <div className="text-xs text-muted-foreground/60 border-t border-border/40 pt-4">
          This system is in mock shell mode. Authentications and persistence layers are bypassed.
        </div>
      </div>
    </div>
  );
}
