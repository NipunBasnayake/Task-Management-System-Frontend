"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import { ApiError } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);

    try {
      await api.login(values);

      const nextPath = searchParams.get("next");
      const destination = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";
      window.location.href = destination;
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        setError("Invalid email or password.");
        return;
      }

      setError(submitError instanceof Error ? submitError.message : "Unable to log in.");
    }
  };

  const registered = searchParams.get("registered") === "1";

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex justify-center">
        <img src="/taskflow.png" alt="TaskFlow" width={48} height={48} className="h-16 w-16" />
      </div>
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Log in</h1>
        <p className="text-sm text-slate-600">Access your tasks and stay on track.</p>
      </header>

      {registered ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Registration successful. Please log in.
        </p>
      ) : null}

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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-sm text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-slate-600 text-center">
        Need an account?{" "}
        <Link
          href="/register"
          className="font-semibold !text-teal-600 hover:!text-teal-700 underline underline-offset-2 transition-colors"
        >
          Register
        </Link>
      </p>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <LoadingSpinner label="Loading login..." />
        </section>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
