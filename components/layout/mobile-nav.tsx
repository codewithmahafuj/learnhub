"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { studentNavigation, adminNavigation, NavItem } from "@/config/navigation";
import { GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  role: "student" | "admin";
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ role, isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const navigation = role === "admin" ? adminNavigation : studentNavigation;

  // Auto-close on path changes
  React.useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Handle escape key to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border/50 shadow-xl transition-transform duration-300 ease-out flex flex-col lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-base tracking-tight">LearnHub</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
            className="h-9 w-9 rounded-md hover:bg-muted/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/60 px-3 pb-2">
              {role === "admin" ? "Admin Portal" : "Student Portal"}
            </p>
            <nav className="space-y-1" aria-label="Mobile Navigation">
              {navigation.map((item: NavItem) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                      "hover:bg-muted/80 hover:text-foreground",
                      active
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground"
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

        {/* Bottom switcher */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <Link
            href={role === "admin" ? "/dashboard" : "/admin/dashboard"}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium border border-border/80 bg-background hover:bg-muted/50 rounded-md transition-colors text-muted-foreground"
          >
            {role === "admin" ? "Switch to Student" : "Switch to Admin"}
          </Link>
        </div>
      </div>
    </>
  );
}
