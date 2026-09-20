import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
  iconClassName?: string;
}

export function BackLink({
  href,
  label,
  className,
  iconClassName,
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <ArrowLeft className={cn("h-3 w-3", iconClassName)} /> {label}
    </Link>
  );
}
