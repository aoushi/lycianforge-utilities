import Link from "next/link";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="space-y-8 rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-primary/10 backdrop-blur">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue orchestrating your projects with the Lycian Forge squad.
        </p>
      </div>
      <SignInForm />
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        Need an account?{" "}
        <Link href="/auth/register" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}


