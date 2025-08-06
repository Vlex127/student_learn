import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that are public and don't require authentication
const publicPaths = [
  '/',
  '/auth',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/book1.jpg',
  '/book.jpg',
  '/placeholder.svg',
  // Add other public paths here
];

// List of admin paths that require admin privileges
const adminPaths = [
  '/admin',
  // Add other admin paths here
];

// List of authenticated user paths
const protectedPaths = [
  '/dashboard',
  '/library',
  '/profile',
  '/my-courses',
  // Add other protected paths here
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Method:', request.method);

  // Skip middleware for public paths and static files
  if (
    publicPaths.some(path => pathname === path || pathname.startsWith(path)) ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    /\.[a-z0-9]+$/i.test(pathname) // Match any file extension
  ) {
    console.log('Skipping middleware for public/static path');
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  console.log('Auth Token:', token ? 'Present' : 'Missing');
  console.log('Is Protected Path:', isProtectedPath);
  console.log('Is Auth Page:', isAuthPage);

  // If no token and trying to access protected path, redirect to login
  if (!token && isProtectedPath) {
    console.log('No token, redirecting to login');
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and trying to access auth page, redirect to home
  if (token && isAuthPage) {
    console.log('Already authenticated, redirecting to home');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // For protected paths, verify the token
  if (token && isProtectedPath) {
    try {
      console.log('Verifying token with backend...');
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!verifyResponse.ok) {
        console.log('Token verification failed, redirecting to login');
        // Token is invalid or expired, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/auth', request.url));
        response.cookies.delete('auth_token', { path: '/' });
        return response;
      }
      
      // If everything is fine, continue with the request
      console.log('Token verified successfully');
      return NextResponse.next();
    } catch (error) {
      console.error('Error verifying token:', error);
      const response = NextResponse.redirect(new URL('/auth', request.url));
      response.cookies.delete('auth_token', { path: '/' });
      return response;
    }
  }

  // For all other cases, continue with the request
  console.log('Continuing with request');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/|.*\.[a-z0-9]+$).*)',
  ],
};
