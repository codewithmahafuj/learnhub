"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCourseAction } from "@/app/admin/courses/actions";
import { cn } from "@/lib/utils";

export interface CourseTableRowProps {
  id: string;
  title: string;
  handle: string;
  status?: string;
  editHref: string;
  className?: string;
}

/**
 * One row in the admin course list (Step 6 Part 3).
 *
 * Now a Client Component so the destructive Delete action can run through a
 * confirmation dialog: the dialog states the course title, warns that the
 * deletion is permanent (cascading to the course's content and enrollments),
 * and disables the confirm button while the server action is in flight.
 * All existing markup, spacing, and styles are unchanged.
 */
export function CourseTableRow({
  id,
  title,
  handle,
  status = "Published",
  editHref,
  className,
}: CourseTableRowProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteCourseAction(id);
      setConfirmOpen(false);
      if (result?.error) {
        console.error(result.error);
      } else {
        // The action revalidates the list; refresh picks up the removal.
        router.refresh();
      }
    } catch {
      console.error("Something went wrong while deleting the course.");
    } finally {
      setDeleting(false);
    }
  };

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
        <Button
          variant="destructive"
          className="h-8 text-xs font-semibold gap-1"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleting) setConfirmOpen(open);
        }}
        title="Delete course?"
        description={
          <>
            You are about to permanently delete <strong>{title}</strong>. This
            action cannot be undone. Associated course content and enrollments
            may also be removed by the database.
          </>
        }
        confirmLabel="Delete Course"
        onConfirm={handleConfirmDelete}
        confirmPending={deleting}
        pendingLabel="Deleting…"
      />
    </div>
  );
}
