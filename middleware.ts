import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware' // We need to create this middleware client

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected and public routes
  const protectedRoutes = ['/dashboard']
  const publicRoutes = ['/login', '/register', '/']

  const { pathname } = request.nextUrl

  // If user is not logged in and is trying to access a protected route, redirect to login
  if (!session && protectedRoutes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and tries to access login/register, redirect to a loading/routing page
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
