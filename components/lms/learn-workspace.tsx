"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { BackLink } from "@/components/layout/back-link";
import { VideoPlayer } from "@/components/lms/video-player";
import {
  CourseTree,
  type CourseNodeData,
} from "@/components/lms/course-tree";
import { EmptyState } from "@/components/ui/empty-state";

export interface LearnWorkspaceProps {
  courseId: string;
  courseTitle: string;
  courseDescription?: string | null;
  /**
   * Serializable node tree built server-side from the live CourseNode rows
   * (sortOrder-ordered, unlimited depth, includes youtubeVideoId).
   * Plain objects only — never Prisma model instances.
   */
  nodes: CourseNodeData[];
}

const VIDEO_TYPES = new Set(["video", "lesson"]);

function isPlayable(node: CourseNodeData): boolean {
  return (
    VIDEO_TYPES.has((node.type ?? "").toLowerCase()) &&
    Boolean(node.youtubeVideoId)
  );
}

/** Depth-first search (sortOrder order) for the first playable lesson. */
function findFirstPlayable(
  nodes: CourseNodeData[]
): CourseNodeData | null {
  for (const node of nodes) {
    if (isPlayable(node)) return node;
    if (node.children?.length) {
      const found = findFirstPlayable(node.children);
      if (found) return found;
    }
  }
  return null;
}

/** Immutable copy of the tree with `active` set on the selected node only. */
function markActive(
  nodes: CourseNodeData[],
  activeId: string | null
): CourseNodeData[] {
  return nodes.map((node) => ({
    ...node,
    active: node.id === activeId,
    children: node.children ? markActive(node.children, activeId) : node.children,
  }));
}

/**
 * Student learning workspace (Step 6 Part 7).
 *
 * The server component loads course + nodes from Prisma and passes plain
 * serializable props; this client component owns ONLY the active-lesson
 * state: selecting a playable row swaps the embedded video in place (no
 * navigation, still /learn/[courseId]). Structural nodes keep their
 * expand/collapse behavior. There are no admin controls here.
 */
export function LearnWorkspace({
  courseId,
  courseTitle,
  courseDescription,
  nodes,
}: LearnWorkspaceProps) {
  // Auto-select the first playable lesson (sortOrder order) on mount; null
  // when the course has no playable content — the player then shows the
  // course-level empty state.
  const [selected, setSelected] = React.useState<CourseNodeData | null>(() =>
    findFirstPlayable(nodes)
  );

  // Any VIDEO/LESSON node can be selected (mirrors which rows render as
  // selectable buttons) — a video-less one then shows the "no video"
  // empty state in the player instead of an iframe.
  const handleSelect = React.useCallback((node: CourseNodeData) => {
    if (!VIDEO_TYPES.has((node.type ?? "").toLowerCase())) return;
    setSelected(node);
  }, []);

  const displayNodes = React.useMemo(
    () => markActive(nodes, selected?.id ?? null),
    [nodes, selected]
  );

  const tree = (
    <CourseTree nodes={displayNodes} onSelectNode={handleSelect} />
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Distraction-free header (unchanged from the previous learn page) */}
      <header className="h-14 border-b border-border/50 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <BackLink
            href={`/courses/${courseId}`}
            label="Exit Focus Mode"
            iconClassName="h-4 w-4"
          />
          <div className="h-4 w-px bg-border/60" />
          <h1 className="text-sm font-semibold tracking-tight truncate max-w-xs md:max-w-lg">
            {courseTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground select-none shrink-0">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>LMS Learning Space</span>
        </div>
      </header>

      {/* Main workspace split */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Player / content column */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 min-w-0">
          {nodes.length === 0 ? (
            <EmptyState
              title="This course doesn't have any content yet"
              description="Course structure and videos will appear here once the instructor adds them."
              className="p-12 border-dashed"
            />
          ) : (
            <>
              {selected && !isPlayable(selected) ? (
                <VideoPlayer
                  videoId={null}
                  title={selected.title}
                  description={selected.description}
                  emptyTitle="No video attached to this item"
                  emptyDescription="This item doesn't have a YouTube video yet."
                />
              ) : (
                <VideoPlayer
                  videoId={selected?.youtubeVideoId ?? null}
                  title={selected?.title ?? courseTitle}
                  description={selected?.description ?? courseDescription}
                  emptyTitle="No videos in this course yet"
                  emptyDescription="Videos will appear here once the instructor attaches YouTube content to a lesson."
                />
              )}

              {/* Mobile: syllabus below the player (sidebar is md+) */}
              <div className="md:hidden space-y-3">
                <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Course syllabus structure
                </h2>
                {tree}
              </div>
            </>
          )}
        </div>

        {/* Desktop syllabus sidebar (unchanged placement) */}
        <div className="hidden md:flex flex-col w-80 border-l border-border/50 bg-muted/10 shrink-0 h-full">
          <div className="p-4 border-b border-border/50 shrink-0">
            <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Course syllabus structure
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {nodes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No content yet.</p>
            ) : (
              tree
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
