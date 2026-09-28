import { PageContainer } from "@/components/layout/page-container";

/** Skeleton shown while the /browse server component queries the database. */
export default function BrowseLoading() {
  return (
    <PageContainer
      title="Browse Courses"
      description="Search, filter, and discover available programs to build your skills."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs"
          >
            <div className="aspect-video w-full animate-pulse bg-muted/60" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
              <div className="h-3 w-full animate-pulse rounded bg-muted/40" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
