import * as React from "react";
import Image from "next/image";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  variant?: "default" | "banner";
}

export function PageContainer({
  children,
  title,
  description,
  variant = "default",
}: PageContainerProps) {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {(title || description) && (
        <>
          {variant === "banner" ? (
            /* Banner Variant Style (Matching Attached Image) */
            <div className="relative overflow-hidden rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 p-6 md:p-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl z-10 text-center md:text-left">
                {title && (
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* Right Illustration Placeholder */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="relative z-10">
                  <Image
                    src="/images/welcome-student.svg" 
                    alt="Welcome Illustration"
                    width={180}
                    height={140}
                    className="object-contain h-36 w-auto md:h-44"
                    priority
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Default Minimal Header Style */
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
        </>
      )}

      <div className="animate-in fade-in-50 duration-300">
        {children}
      </div>
    </div>
  );
}