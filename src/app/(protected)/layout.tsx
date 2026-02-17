import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  );
}
