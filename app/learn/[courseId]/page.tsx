import { GraduationCap } from "lucide-react";
import { BackLink } from "@/components/layout/back-link";
import { VideoPlayer } from "@/components/lms/video-player";
import { CourseTree, CourseNodeData } from "@/components/lms/course-tree";

interface LearnPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { courseId } = await params;

  // Format the ID for display
  const title = courseId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const sidebarCurriculum: CourseNodeData[] = [
    {
      id: "learn-mod-1",
      title: "Module 1: Framework Fundamentals",
      type: "module",
      children: [
        {
          id: "learn-1-1",
          title: "1.1 Project Scaffolding",
          type: "video",
          duration: "Video · 12 mins",
          active: true,
        },
        {
          id: "learn-1-2",
          title: "1.2 Folder Anatomy",
          type: "video",
          duration: "Video · 15 mins",
        },
        {
          id: "learn-1-3",
          title: "1.3 Routing Essentials",
          type: "article",
          duration: "Article · 18 mins",
        },
      ],
    },
    {
      id: "learn-mod-2",
      title: "Module 2: Advanced Rendering States",
      type: "module",
      children: [
        {
          id: "learn-2-1",
          title: "2.1 Dynamic Components",
          type: "video",
          duration: "Video · 22 mins",
        },
        {
          id: "learn-2-2",
          title: "2.2 Hydration Strategies",
          type: "assignment",
          duration: "Assignment · 30 mins",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Distraction-Free Header */}
      <header className="h-14 border-b border-border/50 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <BackLink
            href={`/courses/${courseId}`}
            label="Exit Focus Mode"
            iconClassName="h-4 w-4"
          />
          <div className="h-4 w-px bg-border/60" />
          <h1 className="text-sm font-semibold tracking-tight truncate max-w-xs md:max-w-lg">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground select-none">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>LMS Learning Space</span>
        </div>
      </header>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Left/Main content area (YouTube Embed Player / content skeleton) */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <VideoPlayer
            title="Project Scaffolding Fundamentals"
            lessonNumber="Lecture 1.1"
            description="In this fundamental video, we examine package descriptors, Next.js root hierarchies, and understand compiler alignments designed to keep multi-role routing highly scaleable."
          />
        </div>

        {/* Right side syllabus menu (Hidden on mobile for distraction-free view, shown on md and up) */}
        <div className="hidden md:flex flex-col w-80 border-l border-border/50 bg-muted/10 shrink-0 h-full">
          <div className="p-4 border-b border-border/50 shrink-0">
            <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Course syllabus structure
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <CourseTree nodes={sidebarCurriculum} />
          </div>
        </div>
      </div>
    </div>
  );
}
