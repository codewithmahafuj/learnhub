import Link from "next/link";
import { Search } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogCourseCard } from "@/components/lms/catalog-course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";

// The catalog must reflect the live database on every request, not a
// build-time snapshot taken with whatever rows existed during `next build`.
export const dynamic = "force-dynamic";

/** Validated category filter from the URL (?category=<slug>). */
function parseCategoryFilter(value: string | string[] | undefined): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  // Slugs are lowercase ASCII; cap the length and reject anything unusual.
  const slug = value.trim().toLowerCase().slice(0, 100);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
}

export default async function StudentBrowse({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  // searchParams is a Promise in Next.js 15+.
  const params = await searchParams;
  const categorySlug = parseCategoryFilter(params.category);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  const activeCategory = categories.find((c) => c.slug === categorySlug) ?? null;

  // Only PUBLISHED courses are public. DRAFT and ARCHIVED courses must never
  // appear in the student catalog (schema enum: DRAFT | PUBLISHED | ARCHIVED).
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      category: { select: { name: true } },
    },
  });

  return (
    <PageContainer
      title="Browse Courses"
      description="Search, filter, and discover available programs to build your skills."
    >
      <div className="space-y-6">
        {/* Search input (catalog search is a later step) */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/80" />
          <input
            type="text"
            placeholder="Search coming soon..."
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled
          />
        </div>

        {/* Category chips — real Category rows from the database. Only shown
            when categories exist, so an empty Category table renders nothing
            instead of a lone, confusing "All Courses" chip. */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/browse"
              className={
                !activeCategory
                  ? "inline-flex items-center rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  : "inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              }
            >
              All Courses
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.slug}`}
                className={
                  activeCategory?.id === category.id
                    ? "inline-flex items-center rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    : "inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                }
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {courses.length === 0 ? (
          <EmptyState
            title={
              activeCategory
                ? "No published courses in this category yet"
                : "No courses available yet"
            }
            description={
              activeCategory
                ? "Try another category or check back soon — new courses are on the way."
                : "New courses are currently being prepared. Check back soon for new learning opportunities."
            }
            className="p-12"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CatalogCourseCard
                key={course.id}
                href={`/courses/${course.slug}`}
                title={course.title}
                description={course.description}
                category={course.category?.name ?? null}
                thumbnailUrl={course.thumbnailUrl}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
