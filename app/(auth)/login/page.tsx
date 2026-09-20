import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="bg-primary text-primary-foreground p-2 rounded-xl">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome to LearnHub
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to sign in to your account
        </p>
      </div>

      <LoginForm />

      <div className="relative flex items-center justify-center text-xs uppercase">
        <div className="absolute w-full border-t border-border/50" />
        <span className="relative bg-background px-2 text-muted-foreground">
          Or
        </span>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {"Don't have an account?"}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}

