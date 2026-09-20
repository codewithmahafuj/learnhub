import * as React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PageContainer({
  children,
  title,
  description,
}: PageContainerProps) {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {(title || description) && (
        <div className="space-y-1.5 pb-4 border-b border-border/60">
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="animate-in fade-in-50 duration-300">
        {children}
      </div>
    </div>
  );
}
