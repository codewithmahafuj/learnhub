"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Play,
  FileText,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CourseNodeType =
  | "milestone"
  | "module"
  | "chapter"
  | "section"
  | "lesson"
  | "video"
  | "article"
  | "assignment"
  | string;

export interface CourseNodeData {
  id: string;
  title: string;
  type?: CourseNodeType;
  /** Null when absent (matches the database's nullable column). */
  description?: string | null;
  /** YouTube metadata (Step 6 Part 6) — admin edit dialog pre-fill. */
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  duration?: string;
  itemCount?: number;
  completed?: boolean;
  active?: boolean;
  children?: CourseNodeData[];
}

/**
 * Optional drag-and-drop hooks for the admin tree (Step 6 Part 5).
 *
 * SortableRow wraps THIS node's row element and receives a render-prop for
 * the dedicated drag handle (which must live inside the sortable component,
 * since only it owns the dnd-kit listeners). Every recursion level wraps
 * itself, so each row gets its own sortable registration and handle.
 * Omitted entirely in the student-facing tree — rendering stays identical.
 */
export interface CourseNodeDndSlots {
  SortableRow?: React.ComponentType<{
    node: CourseNodeData;
    children: (handle: React.ReactNode) => React.ReactNode;
  }>;
}

export interface CourseNodeProps {
  node: CourseNodeData;
  depth?: number;
  defaultExpanded?: boolean;
  className?: string;
  /** Drag-and-drop hooks; optional and only supplied by the admin editor. */
  dnd?: CourseNodeDndSlots;
  /**
   * Optional renderer producing admin action buttons for a node (Step 6 Part 4).
   * Propagates down the whole recursion unchanged; omitted in the
   * student-facing tree — rendering stays identical.
   */
  renderNodeActions?: (node: CourseNodeData) => React.ReactNode;
}

export function CourseNode({
  node,
  depth = 0,
  defaultExpanded = true,
  className,
  dnd,
  renderNodeActions,
}: CourseNodeProps) {
  const actions = renderNodeActions?.(node);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const Row = dnd?.SortableRow;

  const renderIcon = () => {
    // Node types are stored uppercase (Prisma enum); normalize for matching.
    switch ((node.type ?? "").toLowerCase()) {
      case "video":
      case "lesson":
        return <Play className={cn("h-4 w-4 shrink-0", node.active ? "text-primary fill-primary/20" : "text-muted-foreground/60")} />;
      case "article":
        return <FileText className="h-4 w-4 shrink-0 text-muted-foreground/60" />;
      case "assignment":
        return <CheckSquare className="h-4 w-4 shrink-0 text-muted-foreground/60" />;
      default:
        return (
          <CheckCircle2
            className={cn(
              "h-4 w-4 shrink-0",
              node.completed
                ? "text-primary"
                : "text-muted-foreground/40"
            )}
          />
        );
    }
  };

  // Render parent node with expandable children
  if (hasChildren) {
    const content = (handle: React.ReactNode) => (
      <div
        className={cn(
          "border border-border/60 rounded-xl bg-background overflow-hidden transition-colors",
          className
        )}
      >
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-5 py-4 bg-muted/20 border-b border-border/40 flex items-center justify-between cursor-pointer select-none hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            {handle}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div>
              <h3 className="font-semibold text-sm text-foreground">{node.title}</h3>
              {node.description && (
                <p className="text-xs text-muted-foreground">{node.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            {node.duration && <span>{node.duration}</span>}
            {node.itemCount !== undefined && <span>{node.itemCount} Lessons</span>}
            {node.children && !node.itemCount && (
              <span>{node.children.length} Items</span>
            )}
            {actions && (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {actions}
              </div>
            )}
          </div>
        </div>

        {isExpanded && node.children && (
          <div className="divide-y divide-border/40 px-5">
            {node.children.map((child) => (
              <CourseNode
                key={child.id}
                node={child}
                depth={depth + 1}
                dnd={dnd}
                renderNodeActions={renderNodeActions}
              />
            ))}
          </div>
        )}
      </div>
    );

    return Row ? <Row node={node}>{content}</Row> : content(null);
  }

  // Render leaf item
  const leafContent = (handle: React.ReactNode) => (
    <div
      className={cn(
        "py-3 flex items-center justify-between text-sm transition-colors",
        node.active ? "text-primary font-semibold" : "text-muted-foreground",
        className
      )}
    >
      <span className="flex items-center gap-2">
        {handle}
        {renderIcon()}
        <span>{node.title}</span>
      </span>
      <span className="flex items-center gap-2">
        {node.duration && (
          <span className="text-xs text-muted-foreground">{node.duration}</span>
        )}
        {actions}
      </span>
    </div>
  );

  return Row ? <Row node={node}>{leafContent}</Row> : leafContent(null);
}
