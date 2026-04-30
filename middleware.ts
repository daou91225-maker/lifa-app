import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_TOKEN = "lifa-secure-2025"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/admin-zone") ||
    pathname.startsWith("/admin-national") ||
    pathname.startsWith("/inscriptions") ||
    pathname.startsWith("/matchs") ||
    pathname.startsWith("/matches") ||
    pathname.startsWith("/exports")

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin-login")) {
    return NextResponse.next()
  }

  const token = request.cookies.get("admin-token")

  if (!token || token.value !== ADMIN_TOKEN) {
    return NextResponse.redirect(new URL("/admin-login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin-zone/:path*",
    "/admin-national/:path*",
    "/inscriptions/:path*",
    "/matchs/:path*",
    "/matches/:path*",
    "/exports/:path*",
  ],
}