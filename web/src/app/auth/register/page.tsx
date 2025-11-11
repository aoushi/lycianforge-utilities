import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <div className="space-y-8 rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-secondary/10 backdrop-blur">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your workspace, invite collaborators, and start tracking progress across projects.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        Already part of the forge?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}


