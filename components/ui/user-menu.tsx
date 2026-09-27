"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Menu } from "@base-ui/react/menu";

export interface UserMenuProps {
  /** Display name (falls back to a derived label). */
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

/**
 * Avatar dropdown in the navbar: shows the signed-in identity and a Sign out
 * action (Auth.js route handler POST, followed by a hard navigation so every
 * server component re-renders against the cleared session).
 */
export function UserMenu({ name, email, role }: UserMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const initials = (name || email || "?")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const signOutNow = () => {
    startTransition(async () => {
      // next-auth's helper performs the csrfToken handshake itself (a bare
      // POST to /api/auth/signout is rejected with MissingCSRF) and then
      // redirects. callbackUrl keeps the user on a public page.
      await signOut({ callbackUrl: "/login", redirect: false });
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Open user menu"
        className="h-8 w-8 rounded-full bg-muted border border-border/80 flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {initials}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50 outline-none">
          <Menu.Popup className="w-56 rounded-lg border border-border bg-background shadow-lg p-1.5 origin-top outline-none">
            <div className="px-2.5 py-2 border-b border-border/60 mb-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {name ?? "Signed in user"}
              </p>
              {email ? (
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              ) : null}
              {role ? (
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" /> {role}
                </p>
              ) : null}
            </div>
            <Menu.Item
              disabled={pending}
              onClick={signOutNow}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-sm rounded-md cursor-pointer outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              {pending ? "Signing out…" : "Sign out"}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
