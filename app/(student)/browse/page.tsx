import { PageContainer } from "@/components/layout/page-container";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/lms/category-filter";
import { EmptyState } from "@/components/ui/empty-state";

export default function StudentBrowse() {
  return (
    <PageContainer
      title="Browse Courses"
      description="Search, filter, and discover available programs to build your skills."
    >
      <div className="space-y-6">
        {/* Search input placeholder */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/80" />
          <Input
            type="text"
            placeholder="Search courses, skills, or authors..."
            className="pl-9 pr-4"
            disabled
          />
        </div>

        {/* Categories Placeholder */}
        <CategoryFilter />

        {/* Empty Catalog State */}
        <EmptyState
          title="No courses available yet"
          description="New courses are currently being prepared. Check back soon for new learning opportunities."
          className="p-12"
        />
      </div>
    </PageContainer>
  );
}
