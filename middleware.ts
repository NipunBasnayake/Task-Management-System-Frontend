import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/tasks"];
const authPages = ["/login", "/register"];

function hasLikelyAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => /(auth|token|session|jwt|refresh)/i.test(cookie.name));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = authPages.includes(pathname);
  const isAuthenticated = hasLikelyAuthCookie(request);

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(isAuthenticated ? "/dashboard" : "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/tasks/:path*"],
};
