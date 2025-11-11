"use client";

import { useSupabase } from "@/components/providers/supabase-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

const registerSchema = z
  .object({
    nickname: z
      .string()
      .min(3, "Nickname must be at least 3 characters.")
      .max(24, "Nickname must be 24 characters or fewer.")
      .regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, hyphen or underscore."),
    email: z.string().email("Please provide a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { client } = useSupabase();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setFocus("nickname");
  }, [setFocus]);

  const onSubmit = handleSubmit(async ({ nickname, email, password }) => {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Check your inbox to confirm your email before signing in.");
    router.push("/auth/sign-in?from=register");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="nickname" className="text-sm font-medium text-foreground/90">
          Nickname
        </label>
        <input
          id="nickname"
          type="text"
          {...register("nickname")}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="ChronicleMaster"
        />
        {errors.nickname && <p className="text-sm text-destructive">{errors.nickname.message}</p>}
      </div>

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
          autoComplete="new-password"
          {...register("password")}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-md shadow-secondary/30 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}


