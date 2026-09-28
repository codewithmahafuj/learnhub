"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { PublishActionState } from "@/app/admin/courses/[courseId]/publish-actions";

export interface PublishPanelProps {
  courseId: string;
  status: string;
  /**
   * Server actions bound to this course id by the server component — the
   * client never supplies or edits the course id.
   */
  publishAction: (state: PublishActionState, formData: FormData) => Promise<PublishActionState>;
  unpublishAction: (state: PublishActionState, formData: FormData) => Promise<PublishActionState>;
  className?: string;
}

/**
 * Visual identity per status — DRAFT / PUBLISHED / ARCHIVED must stay
 * clearly distinguishable at a glance.
 */
const STATUS_META: Record<string, { label: string; badgeClass: string; hint: string }> = {
  PUBLISHED: {
    label: "Published",
    badgeClass: "border-transparent bg-primary/10 text-primary",
    hint: "Visible to students in the public catalog at /browse.",
  },
  DRAFT: {
    label: "Draft",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    hint: "Hidden from students. Publish to make it visible in the catalog.",
  },
  ARCHIVED: {
    label: "Archived",
    badgeClass: "border-border bg-muted text-muted-foreground",
    hint: "Retired from the catalog. Unpublish to return it to a draft.",
  },
};

/**
 * Admin publish controls (Step 6 Part 9, polished in Part 10).
 *
 * Client island inside the server-rendered editor page. Each status change
 * runs through its own <form> + useActionState, so invoking publish/unpublish
 * neither navigates away nor touches the Course Details form — Save Draft /
 * Save Changes behavior stays completely independent. The server actions own
 * ALL authorization, validation, and persistence.
 */
export function PublishPanel({
  courseId,
  status,
  publishAction,
  unpublishAction,
  className,
}: PublishPanelProps) {
  const meta = STATUS_META[status] ?? STATUS_META.DRAFT;
  const isPublished = status === "PUBLISHED";

  return (
    <div
      className={cn(
        "border border-border/50 rounded-xl bg-background px-6 py-4",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Current status — single source of status truth on this page */}
        <div className="flex items-center gap-3 min-w-0">
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 uppercase tracking-wider text-[10px] font-bold",
              meta.badgeClass
            )}
            data-testid="publish-status-badge"
            aria-live="polite"
            aria-label={`Course status: ${meta.label}`}
          >
            {meta.label}
          </Badge>
          <p className="text-xs text-muted-foreground truncate">{meta.hint}</p>
        </div>

        {/* Publish / Unpublish — separate from the metadata form below */}
        <div className="flex items-center gap-2 shrink-0">
          {isPublished ? (
            <StatusChangeForm
              action={unpublishAction}
              label="Unpublish"
              pendingLabel="Unpublishing…"
              icon={<Undo2 className="h-3.5 w-3.5" />}
              courseId={courseId}
            />
          ) : (
            <StatusChangeForm
              action={publishAction}
              label="Publish Course"
              pendingLabel="Publishing…"
              icon={<Globe className="h-3.5 w-3.5" />}
              courseId={courseId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One status-change form per action (no client-side intent dispatching):
 * the button submits to exactly the server action bound for its purpose.
 */
function StatusChangeForm({
  action,
  label,
  pendingLabel,
  icon,
  courseId,
}: {
  action: (state: PublishActionState, formData: FormData) => Promise<PublishActionState>;
  label: string;
  pendingLabel: string;
  icon: React.ReactNode;
  courseId: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = React.useActionState(
    action,
    {} as PublishActionState
  );

  // The action revalidates /browse, /admin/courses and this editor page;
  // refresh also re-renders the server-rendered header for immediate feedback.
  React.useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <>
      <form action={formAction}>
        {/* The id is bound server-side; hidden field keeps the FormData
            contract explicit and is ignored/re-validated by the action. */}
        <input type="hidden" name="courseId" value={courseId} />
        <Button
          type="submit"
          variant={isPending ? "outline" : "default"}
          className="h-8 text-xs font-semibold gap-1.5"
          disabled={isPending}
        >
          {icon} {isPending ? pendingLabel : label}
        </Button>
      </form>
      {state.success && (
        <p className="sr-only" role="status">
          {state.success}
        </p>
      )}
      {state.error && (
        <p className="text-xs text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </>
  );
}
