import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPaths.includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("auth-storage")?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
