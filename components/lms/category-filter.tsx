"use client";

import React, { useState } from "react";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryFilterProps {
  categories?: string[];
  title?: string;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

const DEFAULT_CATEGORIES = [
  "Frontend Engineering",
  "Backend Engineering",
  "Next.js & Server Components",
  "Database Modeling",
  "Software Architecture",
  "TypeScript Mastery",
];

export function CategoryFilter({
  categories = DEFAULT_CATEGORIES,
  title = "Popular Learning Tracks",
  onSelectCategory,
  className,
}: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelect = (category: string) => {
    const next = selectedCategory === category ? null : category;
    setSelectedCategory(next);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <div
      className={cn(
        "border border-border/50 rounded-xl bg-background p-6 space-y-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-2 font-medium text-sm text-foreground">
        <Compass className="h-4 w-4 text-primary" /> {title}
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <div
              key={category}
              onClick={() => handleSelect(category)}
              className={cn(
                "p-3 border rounded-lg text-center cursor-pointer text-xs font-semibold transition-colors select-none",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 hover:border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {category}
            </div>
          );
        })}
      </div>
    </div>
  );
}
