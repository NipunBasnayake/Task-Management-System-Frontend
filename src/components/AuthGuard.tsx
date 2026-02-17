"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/auth";
import { ApiError } from "@/types/api";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        await api.checkSession();
        if (isMounted) {
          setError(null);
          setIsChecking(false);
        }
      } catch (sessionError) {
        if (!isMounted) {
          return;
        }

        if (sessionError instanceof ApiError && sessionError.status === 401) {
          const params = new URLSearchParams();
          const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
          params.set("next", currentPath);
          router.replace(`/login?${params.toString()}`);
          return;
        }

        setError(getAuthErrorMessage(sessionError, "Unable to verify your session right now."));
        setIsChecking(false);
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [retryCounter, router, pathname, searchParams]);

  const retrySessionCheck = () => {
    setError(null);
    setIsChecking(true);
    setRetryCounter((current) => current + 1);
  };

  if (isChecking) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <LoadingSpinner label="Loading session..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-6 w-full max-w-2xl space-y-4 px-4">
        <ErrorBanner message={error} />
        <button
          type="button"
          onClick={retrySessionCheck}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
        >
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
