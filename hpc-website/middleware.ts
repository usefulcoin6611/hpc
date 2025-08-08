import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies or headers
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Middleware hanya proteksi route /admin, bukan /login
  // Public routes that don't require authentication
  const publicRoutes = ['/admin/login', '/api/auth/login', '/api/health', '/api/test-db']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login', '/api/health', '/api/test-db']
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  
  // Check if it's an admin route (excluding login)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
  
  console.log('Middleware: Processing request for', pathname, 'Token exists:', !!token)
  
  // Middleware hanya proteksi route /admin, bukan /login
  // For admin routes without token, redirect to login
  if (isAdminRoute && !token) {
    console.log('Middleware: Redirecting unauthenticated user to login')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  // For API routes, check authentication
  if (pathname.startsWith('/api/') && !isPublicApiRoute && !token) {
    console.log('Middleware: Blocking unauthorized API access')
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Jangan redirect user login di middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 