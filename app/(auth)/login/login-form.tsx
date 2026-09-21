"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

/** Optional safe internal destination carried through the sign-in flow. */
export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form className="space-y-4" action={formAction}>
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="password">
            Password
          </label>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full px-3 py-2 bg-background border border-border/80 rounded-md text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          required
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full h-10 font-medium" disabled={isPending}>
        {isPending ? "Signing In…" : "Sign In"}
      </Button>
    </form>
  );
}
