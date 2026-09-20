import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background border border-border/50 rounded-xl shadow-xs p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
