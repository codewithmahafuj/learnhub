import * as React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, PlayCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface CourseCardProps {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  nextLesson?: string;
  href: string;
  variant?: "enrolled" | "in-progress";
  className?: string;
}

export function CourseCard({
  title,
  description,
  category,
  progress = 0,
  totalLessons,
  completedLessons,
  nextLesson,
  href,
  variant = "enrolled",
  className,
}: CourseCardProps) {
  if (variant === "in-progress") {
    return (
      <div
        className={cn(
          "flex flex-col justify-between rounded-lg border border-border/60 bg-background p-5 shadow-xs transition-all hover:border-border hover:shadow-sm",
          className
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {category && (
              <span className="rounded-md bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground">
                {category}
              </span>
            )}
            <span className="text-xs font-semibold text-muted-foreground">
              {progress}% Completed
            </span>
          </div>

          <h4 className="font-semibold text-sm leading-snug text-foreground">
            {title}
          </h4>

          <div className="space-y-1.5">
            <Progress value={progress} />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              {totalLessons !== undefined && completedLessons !== undefined && (
                <span>
                  Lesson {completedLessons} of {totalLessons}
                </span>
              )}
              {nextLesson && (
                <span className="font-medium text-foreground">Next: {nextLesson}</span>
              )}
            </div>
          </div>
        </div>

        <Link
          href={href}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <PlayCircle className="h-4 w-4" /> Resume Lesson
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border border-border/60 rounded-lg p-5 space-y-4 hover:border-border transition-colors bg-background",
        className
      )}
    >
      <div className="flex items-center gap-2 text-primary font-medium text-sm">
        <BookOpen className="h-4 w-4 shrink-0" /> {title}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <span className="text-xs font-semibold text-muted-foreground">
          Progress: {progress}%
        </span>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View Syllabus <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
