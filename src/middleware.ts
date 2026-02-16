import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected Routes: Require Authentication
const protectedRoutes = [
    '/write',
    '/my-page',
    '/my-page/edit-profile',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute) {
        // Check for Access Token in Cookies
        // Note: We use the cookie name defined in tokenUtils (access_token)
        const token = request.cookies.get('access_token');

        if (!token) {
            // If no token, redirect to login page
            const loginUrl = new URL('/loginpage', request.url);
            // Optional: Add a 'next' param to redirect back after login
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match protected routes
        '/write/:path*',
        '/my-page/:path*',
        // Exclude static files, api, _next, etc.
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
