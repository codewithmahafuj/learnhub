"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

/**
 * Server-side login via Auth.js Credentials.
 *
 * - All verification happens inside auth.ts (single source of truth); this
 *   action never touches bcrypt or the database directly.
 * - Every failure — unknown email, wrong password, malformed input — returns
 *   the same generic message, so nothing reveals whether an email exists.
 * - On success Auth.js sets the JWT session cookie and we redirect.
 */

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  let redirectError: Error | undefined;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // Next.js redirects are control-flow exceptions — let them through.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    redirectError = error as Error;
  }

  if (redirectError) {
    // Unexpected failure — still never leak internals to the client.
    console.error("Unexpected login error:", redirectError);
    return { error: "Invalid email or password." };
  }

  // signIn with redirectTo only returns on failure; success always throws the
  // redirect. This line is unreachable but keeps TypeScript flow analysis happy.
  redirect("/dashboard");
}
