"use client";

import { AlertTriangle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for /browse. The catalog reads the live database
 * on every request; a database failure lands here instead of crashing the
 * whole student layout. Message stays generic — no Prisma or connection
 * details ever reach the client.
 */
export default function BrowseError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer
      title="Browse Courses"
      description="Search, filter, and discover available programs to build your skills."
    >
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong loading the catalog"
        description="We couldn't load the courses right now. Please try again in a moment."
        className="p-12"
        action={
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Try again
          </Button>
        }
      />
    </PageContainer>
  );
}
