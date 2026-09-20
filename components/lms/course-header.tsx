import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CourseHeaderProps {
  badgeText?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function CourseHeader({
  badgeText = "Syllabus Overview",
  title,
  description,
  action,
  className,
}: CourseHeaderProps) {
  return (
    <div
      className={cn(
        "border border-border/50 rounded-xl bg-background p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs",
        className
      )}
    >
      <div className="space-y-2">
        {badgeText && (
          <div>
            <Badge variant="default">{badgeText}</Badge>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>
      {action && <div className="shrink-0 w-full md:w-auto">{action}</div>}
    </div>
  );
}
