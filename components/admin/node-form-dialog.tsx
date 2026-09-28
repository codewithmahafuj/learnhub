"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { COURSE_NODE_TYPES } from "@/lib/course-nodes";
import { extractYouTubeVideoId, isVideoNodeType } from "@/lib/youtube";

export interface NodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "create" adds under parentId (null = root); "edit" updates nodeId. */
  mode: "create" | "edit";
  /** Parent context label shown when creating a child; null = root/course. */
  parentTitle?: string | null;
  /** Parent node id for child creation (null/undefined = root). */
  parentId?: string | null;
  /** Pre-filled values in edit mode. */
  initial?: {
    title: string;
    type: string;
    description: string | null;
    /** Stored YouTube URL — pre-fills the field for VIDEO/LESSON nodes (Part 6). */
    youtubeUrl?: string | null;
    nodeId?: string;
  };
  /** Server action (prevState, formData) — passed from the server component. */
  action: (state: NodeActionStateFromServer, formData: FormData) => Promise<NodeActionStateFromServer>;
  /** Called after a successful action so the tree can refresh/close. */
  onSuccess: () => void;
}

/** Mirrors NodeActionState from the server actions (kept structural to stay client-safe). */
interface NodeActionStateFromServer {
  ok?: boolean;
  error?: string;
}

/**
 * Reusable add/edit dialog for CourseNodes (Step 6 Part 4).
 *
 * Create mode posts parentId + title/type/description; edit mode posts
 * nodeId + the same fields. For VIDEO/LESSON types the dialog also renders a
 * youtubeUrl input (Step 6 Part 6); the video id is never edited here — the
 * server derives it from the url. Duration and publish state still belong to
 * later features.
 */
export function NodeFormDialog({
  open,
  onOpenChange,
  mode,
  parentTitle,
  parentId,
  initial,
  action,
  onSuccess,
}: NodeFormDialogProps) {
  const [state, formAction, isPending] = React.useActionState(action, {});
  const successHandled = React.useRef(false);

  // All form fields are CONTROLLED so the admin's input survives React 19's
  // automatic form reset after an action response (e.g. a failed submit that
  // re-renders the error). The controlled type select also lets the YouTube
  // field appear/disappear as the type changes.
  const [type, setType] = React.useState(initial?.type ?? "MODULE");
  const [youtubeValue, setYoutubeValue] = React.useState(initial?.youtubeUrl ?? "");
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");


  // Step 6 Part 6: the YouTube field belongs to VIDEO/LESSON nodes only.
  const showYouTubeField = isVideoNodeType(type);
  // Live admin preview: shown only while the typed url parses to a valid id.
  const previewVideoId = showYouTubeField ? extractYouTubeVideoId(youtubeValue) : null;

  React.useEffect(() => {
    if (state.ok && !successHandled.current) {
      successHandled.current = true;
      onSuccess();
    }
    if (!state.ok && !state.error) {
      // Reset state cleared — allow a future success to fire again.
      successHandled.current = false;
    }
  }, [state, onSuccess]);

  React.useEffect(() => {
    if (!open) {
      // Fresh form state for the next open.
      successHandled.current = false;
    }
  }, [open]);

  const heading =
    mode === "create"
      ? parentTitle
        ? "Add item"
        : "Add root item"
      : "Edit item";
  const contextLabel = mode === "create" ? (parentTitle ?? "Course Structure") : null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        {/* No CSS transitions: Base UI delays unmount until transitionend,
            which never fires in non-composited/hidden webviews. */}
        <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/50 bg-background p-6 shadow-lg focus:outline-none">
          <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
            {heading}
          </Dialog.Title>
          {contextLabel ? (
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Adding under: <strong>{contextLabel}</strong>
            </Dialog.Description>
          ) : (
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              This item will appear at the top level of the course structure.
            </Dialog.Description>
          )}

          <form action={formAction} className="mt-5 space-y-4">
            {mode === "create" && parentId ? (
              <input type="hidden" name="parentId" value={parentId} />
            ) : null}
            {mode === "edit" && initial?.nodeId ? (
              <input type="hidden" name="nodeId" value={initial.nodeId} />
            ) : null}

            <div className="space-y-1.5">
              <label
                htmlFor="nodeTitle"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Title
              </label>
              <input
                id="nodeTitle"
                name="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. HTML Fundamentals"
                className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="nodeType"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Type
              </label>
              <select
                id="nodeType"
                name="type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                {COURSE_NODE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="nodeDescription"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Description (optional)
              </label>
              <textarea
                id="nodeDescription"
                name="description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short summary shown under the title…"
                className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            {showYouTubeField ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="nodeYouTubeUrl"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  YouTube Video URL (optional)
                </label>
                <input
                  id="nodeYouTubeUrl"
                  name="youtubeUrl"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  value={youtubeValue}
                  onChange={(event) => setYoutubeValue(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
                {previewVideoId ? (
                  // Admin-only preview (Part 6 §8): embed of the parsed id.
                  <div className="mt-2 overflow-hidden rounded-md border border-border/50 aspect-video">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${previewVideoId}`}
                      title="YouTube video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      className="h-full w-full"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {state.error ? (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <div className="flex justify-end gap-3 pt-2 border-t border-border/40">
              <Dialog.Close
                render={
                  <Button type="button" variant="outline" className="h-9 text-xs font-semibold" disabled={isPending}>
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" className="h-9 text-xs font-semibold" disabled={isPending}>
                {isPending ? "Saving…" : mode === "create" ? "Add Item" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
