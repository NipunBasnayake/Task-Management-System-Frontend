import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasLikelyAuthCookie } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = hasLikelyAuthCookie(cookieStore.getAll());

  redirect(isAuthenticated ? "/dashboard" : "/login");
}
