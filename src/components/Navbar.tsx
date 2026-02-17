"use client";

import Image from "next/image";
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/taskflow.png" alt="TaskFlow" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight text-slate-900">TaskFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md border border-slate-400 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}
