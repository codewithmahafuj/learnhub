"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseNodeData } from "@/components/lms/course-node";

/** Snapshot of the current drag the editor feeds to every row. */
export interface DragInfo {
  /** Id of the node being dragged, or null when no drag is active. */
  activeId: string | null;
  /** Id of the row currently under the cursor, or null. */
  overId: string | null;
  /** True when the insertion point is BELOW the hovered row (lower half). */
  dropAfter: boolean;
  /** True while a reorder request is in flight (pending UI state). */
  pending: boolean;
}

interface SortableRowProps {
  node: CourseNodeData;
  info: DragInfo;
  /** Render prop: the dedicated GripVertical drag handle for this row. */
  children: (handle: React.ReactNode) => React.ReactNode;
}

/**
 * Per-row sortable wrapper for the admin course structure (Step 6 Part 5).
 *
 * Each row registers as its own single-item dnd-kit sortable; drop semantics
 * (before/after the hovered row) are decided by the editor on DragEnd, not by
 * sortable-order. Injects:
 *  - a GripVertical drag handle — the ONLY draggable surface (row body,
 *    expand chevron, and action buttons are not draggable),
 *  - a horizontal drop indicator immediately before the row currently
 *    hovered, when the hovered row is a valid drop target (the editor only
 *    sets overId for rows in the dragged node's sibling group).
 *
 * Parent changes are structurally impossible: the server only reorders within
 * one parentId group, and the editor ignores drops onto non-siblings.
 */
export function SortableRow({ node, info, children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: node.id });

  const isBeingDragged = info.activeId === node.id;
  const showIndicator = info.overId === node.id && info.activeId !== node.id;

  const indicator = showIndicator ? (
    <div
      aria-hidden
      data-testid="drop-indicator"
      className="flex items-center gap-1 py-0.5"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
      <span className="h-0.5 flex-1 rounded-full bg-primary" />
    </div>
  ) : null;

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={`Drag to reorder ${node.title}`}
      className={cn(
        "cursor-grab touch-none text-muted-foreground/60 hover:text-foreground transition-colors shrink-0",
        isBeingDragged && "opacity-40",
        info.pending && "pointer-events-none"
      )}
      onClick={(e) => e.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <>
      {showIndicator && !info.dropAfter ? indicator : null}
      <div
        ref={setNodeRef}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        }}
        className={cn(isDragging && "opacity-60 relative z-10")}
      >
        {children(handle)}
      </div>
      {showIndicator && info.dropAfter ? indicator : null}
    </>
  );
}
