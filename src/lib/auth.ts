import { ApiError } from "@/types/api";

type CookieLike = {
  name: string;
};

const AUTH_COOKIE_MATCHER = /(auth|token|session|jwt|refresh)/i;

export function hasLikelyAuthCookie(cookies: CookieLike[]): boolean {
  return cookies.some((cookie) => AUTH_COOKIE_MATCHER.test(cookie.name));
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session is not valid. Please log in again.";
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) {
    return "No due date";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}
