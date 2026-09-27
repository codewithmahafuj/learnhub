"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

/**
 * Notifications bell in the navbar. Opens a small anchored popover with an
 * empty state — the backend has no notifications feature yet, so this makes
 * the existing control honest instead of dead.
 */
export function NotificationsPopover() {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label="Notifications"
        className="relative h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="h-4.5 w-4.5" />
        <span
          aria-hidden
          className={cn(
            "absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full",
            open && "hidden"
          )}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="end" sideOffset={8} className="z-50 outline-none">
          <Popover.Popup className="w-80 rounded-lg border border-border bg-background shadow-lg outline-none">
            <div className="px-4 py-3 border-b border-border/60">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
            </div>
            <div className="px-4 py-8 flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New notifications will appear here.
              </p>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
