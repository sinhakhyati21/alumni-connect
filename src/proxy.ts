import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!session && (isProtected || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminRoute && session?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    session &&
    session.user.role !== "admin" &&
    !session.user.profileComplete &&
    pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/admin/:path*"],
};