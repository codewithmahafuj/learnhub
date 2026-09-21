"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

/**
 * Server-side student registration.
 *
 * Security notes:
 * - Runs exclusively on the server ("use server" file); the client only ever
 *   receives the returned { error } state or the redirect.
 * - Role is hardcoded to STUDENT — never read from form data, so public
 *   registration can never create an ADMIN.
 * - bcrypt hashing happens here only; plaintext passwords are never stored or
 *   logged, and passwordHash is never returned to the caller.
 * - The duplicate-email check plus create are wrapped so that a concurrent
 *   signup racing the check still fails safely on the DB unique constraint.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export interface RegisterState {
  error?: string;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name) return { error: "Name is required." };

  if (!email) return { error: "Email is required." };
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!password) return { error: "Password is required." };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
      },
    });
  } catch {
    // Any database failure (including a race on the unique email index)
    // surfaces as the same safe, generic message. No Prisma errors leak.
    return { error: "An account with this email already exists." };
  }

  redirect("/login?registered=1");
}
