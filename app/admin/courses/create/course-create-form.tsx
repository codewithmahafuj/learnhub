"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Save, Image as ImageIcon } from "lucide-react";

export function CourseCreateForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("development");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="courseTitle" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Course Title
        </label>
        <input
          id="courseTitle"
          type="text"
          placeholder="e.g. Advanced TypeScript Deep Dive"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="courseDescription" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Course Description
        </label>
        <textarea
          id="courseDescription"
          placeholder="Provide a detailed description of the course contents..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="courseCategory" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Category
          </label>
          <select
            id="courseCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="development">Web Development</option>
            <option value="design">UI/UX Design</option>
            <option value="data">Data Science</option>
            <option value="business">Business & Management</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="thumbnailUrl" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Thumbnail URL / Image Placeholder
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="thumbnailUrl"
                type="text"
                placeholder="https://example.com/thumbnail.png"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
            <div className="h-9 w-9 rounded-md border border-border/80 bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-border/40">
        <Link href="/admin/courses">
          <Button type="button" variant="outline" className="h-9 text-xs font-semibold">
            Cancel
          </Button>
        </Link>
        <Button type="button" variant="secondary" className="h-9 text-xs font-semibold">
          Save Draft
        </Button>
        <Button type="submit" className="h-9 text-xs font-semibold gap-1.5">
          <Save className="h-3.5 w-3.5" /> Save and Continue
        </Button>
      </div>
    </form>
  );
}
