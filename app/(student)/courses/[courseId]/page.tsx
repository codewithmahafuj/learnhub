import { PageContainer } from "@/components/layout/page-container";
import { BackLink } from "@/components/layout/back-link";
import { CourseHeader } from "@/components/lms/course-header";
import { CourseTree, CourseNodeData } from "@/components/lms/course-tree";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseDetailProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailProps) {
  const { courseId } = await params;

  // Format the ID for display
  const title = courseId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const curriculumNodes: CourseNodeData[] = [
    {
      id: "module-1",
      title: "Module 1: Framework Fundamentals",
      type: "module",
      description: "Essential starting principles and environment setups.",
      itemCount: 3,
      children: [
        {
          id: "lesson-1-1",
          title: "1.1 Project Scaffolding",
          type: "lesson",
          duration: "12 mins",
          completed: false,
        },
        {
          id: "lesson-1-2",
          title: "1.2 Folder Anatomy",
          type: "lesson",
          duration: "15 mins",
          completed: false,
        },
        {
          id: "lesson-1-3",
          title: "1.3 Routing Essentials",
          type: "lesson",
          duration: "18 mins",
          completed: false,
        },
      ],
    },
    {
      id: "module-2",
      title: "Module 2: Advanced Rendering States",
      type: "module",
      description: "Exploring hydrations, server-side data models, and caching.",
      itemCount: 2,
      children: [
        {
          id: "lesson-2-1",
          title: "2.1 Dynamic Components",
          type: "lesson",
          duration: "22 mins",
          completed: false,
        },
        {
          id: "lesson-2-2",
          title: "2.2 Hydration Strategies",
          type: "lesson",
          duration: "30 mins",
          completed: false,
        },
      ],
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Back navigation */}
        <div>
          <BackLink href="/courses" label="Back to My Courses" />
        </div>

        {/* Course Header Banner */}
        <CourseHeader
          badgeText="Syllabus Overview"
          title={title}
          description="Welcome to the syllabus outline. Below is a structured plan of learning modules, video assets, and progress checkboxes designed to take you from beginner to advanced."
          action={
            <Link href={`/learn/${courseId}`} className="shrink-0 w-full md:w-auto">
              <Button className="w-full md:w-auto h-11 px-6 font-medium gap-2">
                <PlayCircle className="h-5 w-5" /> Start Learning
              </Button>
            </Link>
          }
        />

        {/* Modules / Chapters Tree */}
        <CourseTree
          title="Course Curriculum Modules"
          nodes={curriculumNodes}
        />
      </div>
    </PageContainer>
  );
}
