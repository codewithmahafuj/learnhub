import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CatalogCourseCardProps {
  /** Existing public detail route for this course (e.g. /courses/<slug>). */
  href: string;
  title: string;
  description?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  className?: string;
}

/**
 * Student catalog card for the /browse grid (Step 6 Part 8).
 *
 * Server-safe presentational component — no client state. Renders only the
 * Course fields the schema stores today (title, description, thumbnail,
 * category name). External thumbnails load unoptimized because the project
 * has no remote image host allowlist and admin-entered URLs can point at any
 * https host; bounds stay via object-cover inside the fixed 16:9 band.
 */
export function CatalogCourseCard({
  href,
  title,
  description,
  category,
  thumbnailUrl,
  className,
}: CatalogCourseCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        className
      )}
    >
      {/* 16:9 thumbnail band (placeholder icon when no thumbnailUrl) */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <BookOpen className="h-10 w-10" />
          </div>
        )}
        {category && (
          <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-xs">
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
