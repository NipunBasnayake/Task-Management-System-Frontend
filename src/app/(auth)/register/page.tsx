"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ErrorBanner from "@/components/ErrorBanner";
import { api } from "@/lib/api";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);

    try {
      await api.register({
        email: values.email,
        password: values.password,
      });

      router.push("/login?registered=1");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to register.");
    }
  };

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
        <p className="text-sm text-slate-600">Start managing your tasks with a secure cookie-based session.</p>
      </header>

      {error ? <ErrorBanner message={error} /> : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            disabled={isSubmitting}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email ? (
            <p id="email-error" className="text-sm text-red-600">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            disabled={isSubmitting}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password ? (
            <p id="password-error" className="text-sm text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-800">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            disabled={isSubmitting}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          />
          {errors.confirmPassword ? (
            <p id="confirm-password-error" className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-700 hover:text-teal-600">
          Log in
        </Link>
      </p>
    </section>
  );
}
