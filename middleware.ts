import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthRoute = pathname === "/login"
  const isApiAuthRoute = pathname.startsWith("/api/auth")

  if (isApiAuthRoute) return NextResponse.next()

  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL("/login", req.nextUrl)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isAuthRoute) {
    const dashboardUrl = new URL("/dashboard", req.nextUrl)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/runtime).*)",
  ],
}
