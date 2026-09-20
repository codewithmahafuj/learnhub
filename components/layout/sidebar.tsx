"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { studentNavigation, adminNavigation, NavItem } from "@/config/navigation";
import { GraduationCap } from "lucide-react";

interface SidebarProps {
  role: "student" | "admin";
  className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();
  const navigation = role === "admin" ? adminNavigation : studentNavigation;

  const isActive = (href: string) => {
    // Exact match for dashboard, startswith for subpages (if any, like courseId)
    if (href === "/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 border-r border-border/50 bg-sidebar h-screen sticky top-0 shrink-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-14 px-6 border-b border-border/50 flex items-center gap-2.5">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-semibold text-lg tracking-tight">LearnHub</span>
      </div>

      {/* Role Indicator & Nav links */}
      <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/60 px-3 pb-2">
            {role === "admin" ? "Admin Portal" : "Student Portal"}
          </p>
          <nav className="space-y-1">
            {navigation.map((item: NavItem) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground/75"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground/80")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Back link */}
      <div className="p-4 border-t border-border/50 bg-sidebar/50">
        <Link
          href={role === "admin" ? "/dashboard" : "/admin/dashboard"}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium border border-border/80 hover:bg-muted/50 rounded-md transition-colors text-muted-foreground"
        >
          {role === "admin" ? "Switch to Student" : "Switch to Admin"}
        </Link>
      </div>
    </aside>
  );
}
