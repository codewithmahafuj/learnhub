import * as React from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  /**
   * VALIDATED YouTube video id (server-derived via lib/youtube.ts).
   * The embed URL is always built here from this id — never from raw user
   * input — so no arbitrary iframe URL can be injected. Null renders the
   * informative empty state instead of an iframe.
   */
  videoId: string | null;
  /** Selected lesson title (also used as the iframe's accessible title). */
  title: string;
  /** Optional lesson description shown under the player. */
  description?: string | null;
  /** Empty-state text when videoId is null. */
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function VideoPlayer({
  videoId,
  title,
  description,
  emptyTitle = "No video available",
  emptyDescription = "This item doesn't have a video yet.",
  className,
}: VideoPlayerProps) {
  return (
    <div className={cn("space-y-6 max-w-4xl mx-auto w-full", className)}>
      {/* Responsive 16:9 player (or informative empty state) */}
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-neutral-950 shadow-md">
        {videoId ? (
          <iframe
            // The id is server-validated ([A-Za-z0-9_-]{11}) — interpolated
            // into a fixed youtube-nocookie embed path only.
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-neutral-400 gap-3 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Play className="h-6 w-6 ml-0.5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-300">{emptyTitle}</p>
              <p className="text-xs text-neutral-500 max-w-sm">{emptyDescription}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson metadata */}
      <div className="space-y-3 pb-6 md:pb-12">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
