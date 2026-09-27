"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NodeFormDialog } from "@/components/admin/node-form-dialog";
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
}

type DialogState =
  | { mode: "create"; parentId: string | null; parentTitle: string | null }
  | { mode: "edit"; node: CourseNodeData }
  | null;

/**
 * Admin editor for the recursive course structure (Step 6 Part 4).
 *
 * Wraps the shared student-facing CourseTree and injects per-node actions
 * (Add Child / Edit / Delete) through its renderNodeActions slot. All data
 * arrives as plain serializable props; all mutations run through the bound
 * server actions, which independently re-verify ADMIN authorization.
 */
export function CourseStructureEditor({
  nodes,
  createAction,
  updateAction,
  deleteAction,
}: CourseStructureEditorProps) {
  const router = useRouter();
  const [dialog, setDialog] = React.useState<DialogState>(null);
  const [confirmNode, setConfirmNode] = React.useState<CourseNodeData | null>(null);
  const [deleting, setDeleting] = React.useState(false);
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

      <CourseTree nodes={nodes} renderNodeActions={renderNodeActions} />

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
