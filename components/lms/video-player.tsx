import * as React from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  title?: string;
  lessonNumber?: string;
  description?: string;
  className?: string;
}

export function VideoPlayer({
  title = "Project Scaffolding Fundamentals",
  lessonNumber = "Lecture 1.1",
  description,
  className,
}: VideoPlayerProps) {
  return (
    <div className={cn("space-y-6 max-w-4xl mx-auto w-full", className)}>
      {/* Aspect Video Embed Player Placeholder */}
      <div className="aspect-video w-full bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center text-neutral-400 relative overflow-hidden group shadow-md">
        <div className="absolute inset-0 bg-radial-at-c from-neutral-800/20 to-neutral-950/90 pointer-events-none" />
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-lg z-10">
          <Play className="h-8 w-8 fill-current ml-1" />
        </div>
        <span className="text-xs font-semibold text-neutral-500 mt-4 tracking-wide uppercase select-none z-10">
          Embedded Video Player Hub Placeholder
        </span>
      </div>

      {/* Lesson Metadata Footer */}
      {(title || description || lessonNumber) && (
        <div className="space-y-3 pb-12">
          <div className="space-y-1">
            {lessonNumber && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-primary">
                {lessonNumber}
              </span>
            )}
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {title}
              </h2>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
