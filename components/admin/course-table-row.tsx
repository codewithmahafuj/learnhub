import * as React from "react";
import Link from "next/link";
import { BookOpen, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CourseTableRowProps {
  id: string;
  title: string;
  handle: string;
  status?: string;
  editHref: string;
  className?: string;
}

export function CourseTableRow({
  title,
  handle,
  status = "Published",
  editHref,
  className,
}: CourseTableRowProps) {
  return (
    <div
      className={cn(
        "p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors",
        className
      )}
    >
      <div className="space-y-1">
        <Badge variant="published">{status}</Badge>
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <BookOpen className="h-4 w-4 text-muted-foreground" /> {title}
        </h3>
        <p className="text-xs text-muted-foreground">URL Handle: {handle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link href={editHref}>
          <Button variant="outline" className="h-8 text-xs font-semibold gap-1">
            <Settings2 className="h-3.5 w-3.5" /> Edit Syllabus
          </Button>
        </Link>
      </div>
    </div>
  );
}
