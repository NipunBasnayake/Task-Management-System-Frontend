import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { hasLikelyAuthCookie } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!hasLikelyAuthCookie(cookieStore.getAll())) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  );
}
