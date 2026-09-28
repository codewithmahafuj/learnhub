"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NodeFormDialog } from "@/components/admin/node-form-dialog";
import {
  SortableRow,
  type DragInfo,
} from "@/components/admin/dnd-row";
import { CourseTree, type CourseNodeData } from "@/components/lms/course-tree";
import type { NodeTreeItem } from "@/lib/course-nodes";

interface ActionState {
  ok?: boolean;
  error?: string;
}

export interface CourseStructureEditorProps {
  /** Nested tree built server-side from the live CourseNode rows. */
  nodes: NodeTreeItem[];
  /** Bound server actions (courseId baked in on the server). */
  createAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  updateAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: (nodeId: string) => Promise<ActionState>;
  /**
   * Bound reorder action (Step 6 Part 5): drop nodeId before/after targetId.
   * The server re-verifies ADMIN, course ownership of BOTH nodes, and the
   * shared parentId — the client is never trusted.
   */
  reorderAction: (
    nodeId: string,
    targetId: string,
    position: "before" | "after"
  ) => Promise<ActionState>;
}

type DialogState =
  | { mode: "create"; parentId: string | null; parentTitle: string | null }
  | { mode: "edit"; node: CourseNodeData }
  | null;

/** Flattened display-order row plus the sibling group it belongs to. */
interface FlatRow {
  node: CourseNodeData;
  /** Parent id — null for root rows. Defines the sibling group. */
  parentId: string | null;
  /** Zero-based index within the parent's child array. */
  index: number;
}

/** Depth-first walk producing one entry per visible row. */
function flattenRows(nodes: NodeTreeItem[], parentId: string | null, out: FlatRow[]): void {
  nodes.forEach((node, index) => {
    out.push({ node, parentId, index });
    if (node.children?.length) {
      flattenRows(node.children, node.id, out);
    }
  });
}

/**
 * Admin editor for the recursive course structure (Step 6 Part 4/5).
 *
 * Wraps the shared student-facing CourseTree and injects per-node actions
 * (Add Child / Edit / Delete) plus drag-and-drop sibling reordering. All data
 * arrives as plain serializable props; all mutations run through bound server
 * actions, which independently re-verify ADMIN authorization.
 */
export function CourseStructureEditor({
  nodes,
  createAction,
  updateAction,
  deleteAction,
  reorderAction,
}: CourseStructureEditorProps) {
  const router = useRouter();
  const [dialog, setDialog] = React.useState<DialogState>(null);
  const [confirmNode, setConfirmNode] = React.useState<CourseNodeData | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // ---- Drag-and-drop state (Step 6 Part 5) --------------------------------
  // While one reorder request is in flight, further drops are ignored (rapid
  // drag/drop protection); the ref mirrors the flag synchronously so two
  // drops in the same tick cannot both pass the guard.
  const reorderPendingRef = React.useRef(false);
  const [dragInfo, setDragInfo] = React.useState<DragInfo>({
    activeId: null,
    overId: null,
    dropAfter: false,
    pending: false,
  });
  const [activeNode, setActiveNode] = React.useState<CourseNodeData | null>(null);
  // Whether the live hover point sits before or after the hovered row
  // (written on every DragOver, consumed on DragEnd).
  const dropPositionRef = React.useRef<"before" | "after">("before");

  // Bumped on every dialog open so the (uncontrolled) form remounts with the
  // correct pre-filled values instead of stale state from the previous use.
  const [dialogSeq, setDialogSeq] = React.useState(0);
  const openDialog = (next: DialogState) => {
    setDialogSeq((s) => s + 1);
    setDialog(next);
  };

  const openAddRoot = () => openDialog({ mode: "create", parentId: null, parentTitle: null });
  const openAddChild = (node: CourseNodeData) =>
    openDialog({ mode: "create", parentId: node.id, parentTitle: node.title });
  const openEdit = (node: CourseNodeData) => openDialog({ mode: "edit", node });

  // ---- Flattened row registry ----------------------------------------------
  // Rebuilt on every render from the (server-provided, sortOrder-ordered)
  // tree: id → { parentId, index } for sibling checks, plus the id list for
  // collision detection.
  const flatRows = React.useMemo(() => {
    const rows: FlatRow[] = [];
    flattenRows(nodes, null, rows);
    return rows;
  }, [nodes]);
  const rowsById = React.useMemo(() => {
    const map = new Map<string, FlatRow>();
    for (const row of flatRows) map.set(row.node.id, row);
    return map;
  }, [flatRows]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Small delay to keep plain clicks on buttons/links working; the handle
      // is the only activator anyway.
      activationConstraint: { distance: 4 },
    }),
    // sortableKeyboardCoordinates: arrow keys jump to the previous/next
    // SIBLING rather than translating 25px — keyboard drags actually land on
    // the neighboring row instead of dropping over self (no-op).
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Pointer-accurate collision detection: with the default rectIntersection
  // the translated dragged row can "win" over nested (non-sibling) rows it
  // passes through, which the sibling filter then correctly rejects — making
  // drops onto the intended sibling silently no-op. Following the POINTER
  // instead means "you drop exactly where the cursor is"; keyboard drags keep
  // rect-based detection (they have no pointer position).
  const collisionDetection: CollisionDetection = (args) =>
    args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveNode(rowsById.get(id)?.node ?? null);
    // Keyboard drags have no pointer position — default to "before" so the
    // drop position is deterministic for that sensor.
    dropPositionRef.current = "before";
    setDragInfo({ activeId: id, overId: id, dropAfter: false, pending: false });
  };

  /**
   * Before/after decision for a drop, derived from the POINTER position
   * relative to the hovered row's vertical midpoint. Used for the live
   * indicator (DragMove) and recomputed at DragEnd so the committed position
   * always reflects the pointer at drop time (move events can be throttled).
   */
  const computeDropPosition = (
    activeId: string,
    overId: string | null,
    overRect: { top: number; height: number } | undefined,
    activatorY: number | undefined,
    deltaY: number
  ): "before" | "after" | null => {
    if (!overId || !overRect || typeof activatorY !== "number") return null;
    const activeRow = rowsById.get(activeId);
    const overRow = rowsById.get(overId);
    // Only rows in the SAME sibling group are valid drop targets; hovering a
    // non-sibling shows no indicator and drop is a no-op. (The server
    // re-checks this; here it just keeps the UI honest.)
    if (!activeRow || !overRow || activeRow.parentId !== overRow.parentId) {
      return null;
    }
    return activatorY + deltaY > overRect.top + overRect.height / 2
      ? "after"
      : "before";
  };

  /**
   * Runs on EVERY pointer/keyboard move while dragging (not just when the
   * hovered row changes — onDragOver alone misses mid-row corrections, e.g.
   * entering a row from below then moving to its upper half).
   */
  const handleDragMove = (event: DragMoveEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    // Ignore hover over the dragged row itself.
    const effectiveOver = overId === activeId ? null : overId;

    const position = computeDropPosition(
      activeId,
      effectiveOver,
      event.over?.rect,
      (event.activatorEvent as PointerEvent | undefined)?.clientY,
      event.delta.y
    );
    if (position) dropPositionRef.current = position;

    setDragInfo({
      activeId,
      overId: position ? effectiveOver : null,
      dropAfter: dropPositionRef.current === "after",
      pending: false,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    setActiveNode(null);

    // Recompute the position at drop time from the final drag delta — move
    // events can arrive throttled, so the last DragMove may be stale.
    const position =
      computeDropPosition(
        activeId,
        overId,
        event.over?.rect,
        (event.activatorEvent as PointerEvent | undefined)?.clientY,
        event.delta.y
      ) ?? dropPositionRef.current;

    const activeRow = rowsById.get(activeId);
    const overRow = overId ? rowsById.get(overId) : undefined;
    if (
      !activeRow ||
      !overRow ||
      !overId ||
      activeId === overId ||
      activeRow.parentId !== overRow.parentId ||
      reorderPendingRef.current
    ) {
      // Invalid drop (non-sibling, self, or a reorder already in flight) —
      // just reset the drag visuals.
      setDragInfo({ activeId: null, overId: null, dropAfter: false, pending: false });
      return;
    }

    reorderPendingRef.current = true;
    // Freeze every drag handle while the request is in flight (rapid-drop
    // guard) by parking the snapshot in its pending state.
    setDragInfo({ activeId: null, overId: null, dropAfter: false, pending: true });
    void (async () => {
      try {
        const result = await reorderAction(activeId, overId, position);
        if (result?.error) {
          console.error(result.error);
        }
        // ok / no-op: server already revalidated the route — refresh to show
        // the resulting order.
        router.refresh();
      } catch {
        console.error("Something went wrong while reordering the items.");
      } finally {
        reorderPendingRef.current = false;
        setDragInfo({ activeId: null, overId: null, dropAfter: false, pending: false });
      }
    })();
  };

  const handleDragCancel = () => {
    setActiveNode(null);
    setDragInfo({ activeId: null, overId: null, dropAfter: false, pending: false });
  };

  const handleDelete = async () => {
    if (!confirmNode || deleting) return;
    setDeleting(true);
    try {
      const result = await deleteAction(confirmNode.id);
      if (result?.error) {
        console.error(result.error);
        setConfirmNode(null);
      } else {
        // Close first so the confirm dialog unmounts cleanly, then refresh.
        setConfirmNode(null);
        router.refresh();
      }
    } catch {
      console.error("Something went wrong while deleting the item.");
      setConfirmNode(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderNodeActions = (node: CourseNodeData) => (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-xs font-semibold gap-1"
        onClick={() => openAddChild(node)}
      >
        <Plus className="h-3 w-3" /> Add Child
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-xs font-semibold gap-1"
        onClick={() => openEdit(node)}
      >
        <Pencil className="h-3 w-3" /> Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="text-xs font-semibold gap-1"
        onClick={() => setConfirmNode(node)}
      >
        <Trash2 className="h-3 w-3" /> Delete
      </Button>
    </>
  );

  // Drag handle marker kept in a shared bundle so every row at every depth
  // gets one without the editor knowing the tree shape.
  const dndSlots = React.useMemo(
    () => ({
      SortableRow: (props: {
        node: CourseNodeData;
        children: (handle: React.ReactNode) => React.ReactNode;
      }) => <SortableRow {...props} info={dragInfo} />,
    }),
    [dragInfo]
  );

  if (nodes.length === 0) {
    return (
      <>
        <EmptyState
          title="No course content yet"
          description="Start building the course structure by adding your first item. Any item can contain further nested items."
          className="p-12 border-dashed"
          action={
            <Button className="h-9 gap-1.5 font-semibold text-xs" onClick={openAddRoot}>
              <Plus className="h-4 w-4" /> Add Root Item
            </Button>
          }
        />
        <NodeFormDialog
          key={`node-dialog-${dialogSeq}`}
          open={dialog !== null && dialog.mode === "create" && dialog.parentId === null}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode="create"
          parentTitle={null}
          action={createAction}
          onSuccess={() => {
            setDialog(null);
            router.refresh();
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end pb-3">
        <Button variant="outline" className="h-9 gap-1.5 text-xs font-semibold" onClick={openAddRoot}>
          <Plus className="h-4 w-4" /> Add Root Item
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <CourseTree
          nodes={nodes}
          renderNodeActions={renderNodeActions}
          dnd={dndSlots}
        />

        <DragOverlay>
          {activeNode ? (
            <div className="rounded-lg border border-primary/40 bg-background px-4 py-2 shadow-lg text-sm font-medium text-foreground">
              {activeNode.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <NodeFormDialog
        key={`node-dialog-${dialogSeq}`}
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        mode={dialog?.mode ?? "create"}
        parentTitle={dialog?.mode === "create" ? dialog.parentTitle : null}
        parentId={dialog?.mode === "create" ? dialog.parentId : null}
        initial={
          dialog?.mode === "edit"
            ? {
                title: dialog.node.title,
                type: dialog.node.type ?? "MODULE",
                description: dialog.node.description ?? null,
                youtubeUrl: dialog.node.youtubeUrl ?? null,
                nodeId: dialog.node.id,
              }
            : undefined
        }
        action={dialog?.mode === "edit" ? updateAction : createAction}
        onSuccess={() => {
          setDialog(null);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={confirmNode !== null}
        onOpenChange={(open) => {
          if (!deleting && !open) setConfirmNode(null);
        }}
        title={confirmNode ? `Delete ${confirmNode.title}?` : "Delete item?"}
        description="This will permanently delete this item and all nested items inside it. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        confirmPending={deleting}
        pendingLabel="Deleting…"
      />
    </>
  );
}
