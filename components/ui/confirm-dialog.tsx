"use client";

import * as React from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  /** Whether the dialog is open (controlled). */
  open: boolean;
  /** Called with `false` when the user dismisses the dialog. */
  onOpenChange: (open: boolean) => void;
  /** Short dialog title, e.g. "Delete course?". */
  title: string;
  /** Body text describing the consequences. */
  description: React.ReactNode;
  /** Destructive confirmation button label, e.g. "Delete Course". */
  confirmLabel?: string;
  /** Called when the user presses the destructive confirm button. */
  onConfirm: () => void;
  /** Disables the confirm button (e.g. while the action is pending). */
  confirmPending?: boolean;
  /** When true, the confirm button shows a pending label and stays disabled. */
  pendingLabel?: string;
}

/**
 * Reusable confirmation dialog (Step 6 Part 3).
 *
 * Thin, controlled wrapper around Base UI's alert-dialog parts, styled with
 * the existing card/button tokens so it matches the rest of the admin UI.
 * The destructive action fires ONLY from the confirm button; backdrop and
 * Escape dismissals are treated as cancel.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  confirmPending = false,
  pendingLabel = "Working…",
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/40 transition-opacity" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/50 bg-background p-6 shadow-lg focus:outline-none">
          <AlertDialog.Title className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Close
              render={
                <Button variant="outline" className="h-9 text-xs font-semibold" disabled={confirmPending}>
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              className="h-9 text-xs font-semibold"
              onClick={onConfirm}
              disabled={confirmPending}
            >
              {confirmPending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
