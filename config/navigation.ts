import {
  LayoutDashboard,
  BookOpen,
  Compass,
  GraduationCap,
  User,
  Settings,
  Users,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const studentNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Browse Courses",
    href: "/browse",
    icon: Compass,
  },
  {
    title: "Progress",
    href: "/progress",
    icon: GraduationCap,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const adminNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Enrollments",
    href: "/admin/enrollments",
    icon: ClipboardList,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];
