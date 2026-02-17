"use client";

import Link from "next/link";
import { useState } from "react";

import { api } from "@/lib/api";

export default function Navbar() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await api.logout();
    } catch {
      // Logout endpoint is optional. Redirecting still clears protected access in the app.
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
          TaskFlow
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}
