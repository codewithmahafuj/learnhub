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
  description?: string;
  duration?: string;
  itemCount?: number;
  completed?: boolean;
  active?: boolean;
  children?: CourseNodeData[];
}

export interface CourseNodeProps {
  node: CourseNodeData;
  depth?: number;
  defaultExpanded?: boolean;
  className?: string;
}

export function CourseNode({
  node,
  depth = 0,
  defaultExpanded = true,
  className,
}: CourseNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = Boolean(node.children && node.children.length > 0);

  const renderIcon = () => {
    switch (node.type) {
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
    return (
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
          </div>
        </div>

        {isExpanded && node.children && (
          <div className="divide-y divide-border/40 px-5">
            {node.children.map((child) => (
              <CourseNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render leaf item
  return (
    <div
      className={cn(
        "py-3 flex items-center justify-between text-sm transition-colors",
        node.active ? "text-primary font-semibold" : "text-muted-foreground",
        className
      )}
    >
      <span className="flex items-center gap-2">
        {renderIcon()}
        <span>{node.title}</span>
      </span>
      {node.duration && (
        <span className="text-xs text-muted-foreground">{node.duration}</span>
      )}
    </div>
  );
}
