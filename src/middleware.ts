import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected Routes Pattern
const protectedRoutes = [
    '/write',
    '/my-page',
    '/my-page/edit-profile',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute) {
        // Read the access token from cookies
        // Note: 'access_token' is the name defined in tokenUtils / openapi spec (assumed, usually lowercase snake_case or camelCase)
        // tokenUtils uses 'access_token'.
        const token = request.cookies.get('access_token')?.value;

        if (!token) {
            // Redirect to login page if no token found
            const loginUrl = new URL('/loginpage', request.url);
            // Optional: Add ?next=pathname to redirect back after login
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/write/:path*',
        '/my-page/:path*',
    ],
};
