"use client";

import React from "react";
import {
  CourseNode,
  CourseNodeData,
  type CourseNodeDndSlots,
} from "./course-node";
import { cn } from "@/lib/utils";

export interface CourseTreeProps {
  nodes: CourseNodeData[];
  title?: string;
  className?: string;
  /**
   * Renders a node's data into optional admin action buttons (Step 6 Part 4).
   * Omitted in the student-facing tree — rendering stays identical.
   */
  renderNodeActions?: (node: CourseNodeData) => React.ReactNode;
  /**
   * Drag-and-drop hooks threaded into every row (Step 6 Part 5). The admin
   * editor supplies these; the student-facing tree omits them entirely.
   */
  dnd?: CourseNodeDndSlots;
  /**
   * Student lesson selection (Step 6 Part 7) — threaded into every node.
   * See CourseNodeProps.onSelectNode.
   */
  onSelectNode?: (node: CourseNodeData) => void;
}

export function CourseTree({
  nodes,
  title,
  className,
  renderNodeActions,
  dnd,
  onSelectNode,
}: CourseTreeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h2 className="text-lg font-semibold tracking-tight text-foreground px-1">
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {nodes.map((node) => (
          <CourseNode
            key={node.id}
            node={node}
            depth={0}
            dnd={dnd}
            renderNodeActions={renderNodeActions}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </div>
  );
}

export type { CourseNodeData };
export type { CourseNodeDndSlots } from "./course-node";
