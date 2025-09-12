
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here-change-in-production" 
  })

  const { pathname } = req.nextUrl

  // Allow access to auth pages when not signed in
  if (pathname.startsWith('/auth') || pathname.startsWith('/signup')) {
    return NextResponse.next()
  }

  // Allow access to public pages
  if (pathname === '/' || pathname.startsWith('/verify')) {
    return NextResponse.next()
  }

  // Redirect to auth page if not authenticated for protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
