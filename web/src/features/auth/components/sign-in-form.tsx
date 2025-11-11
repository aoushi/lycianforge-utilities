"use client";

import { useSupabase } from "@/components/providers/supabase-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Please provide a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const { client } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  useEffect(() => {
    const from = searchParams.get("from");
    if (from === "register") {
      toast.success("Account created. You can sign in once you confirm your email.");
    }
  }, [searchParams]);

  const onSubmit = handleSubmit(async (values) => {
    const { error } = await client.auth.signInWithPassword(values);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back!");
    router.push("/projects");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground/90">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground/90">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}


