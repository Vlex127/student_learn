import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

  // Get the token using NextAuth
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

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

  // For admin paths, check if user has admin privileges
  if (token && isAdminPath) {
    const isAdmin = token.isAdmin || false;
    if (!isAdmin) {
      console.log('Non-admin user trying to access admin path, redirecting to home');
      return NextResponse.redirect(new URL('/home', request.url));
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
