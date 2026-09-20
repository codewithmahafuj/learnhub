"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface NavbarProps {
  role: "student" | "admin";
  onMenuClick: () => void;
  className?: string;
}

export function Navbar({ role, onMenuClick, className }: NavbarProps) {
  const pathname = usePathname();

  // Helper to get breadcrumb text from current pathname
  const getBreadcrumb = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Home";
    
    // Capitalize each part of the URL and return them
    return parts
      .map((part) => {
        if (part === "admin") return "Admin";
        // Remove dashes and capitalize words
        return part
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      })
      .join("  /  ");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 border-b border-border/50 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 md:px-6 w-full",
        className
      )}
    >
      {/* Left side: Hamburger (Mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 text-muted-foreground hover:bg-muted/80 rounded-md"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Path Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 tracking-wide">
          <span className="hover:text-foreground transition-colors cursor-pointer">LMS</span>
          <span>/</span>
          <span className="text-foreground/90 font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right side: Notifications & User profile */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:bg-muted/80 rounded-md relative"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
        </Button>

        {/* Simple Profile Placeholder */}
        <div className="h-8 w-8 rounded-full bg-muted border border-border/80 flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer ml-1 select-none">
          {role === "admin" ? "AD" : "ST"}
        </div>
      </div>
    </header>
  );
}
