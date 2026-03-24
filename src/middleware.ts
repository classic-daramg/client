import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const IS_MAINTENANCE = false; // 서버 점검 모드 플래그

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. 서버 점검 모드 처리
    if (IS_MAINTENANCE) {
        // 이미 점검 페이지에 있거나, 내부 정적 리소스인 경우 통과
        if (pathname.startsWith('/inspection') ||
            pathname.startsWith('/_next') ||
            pathname.includes('.')) {
            return NextResponse.next();
        }
        // 나머지 모든 요청은 점검 페이지로 리다이렉트
        return NextResponse.redirect(new URL('/inspection', request.url));
    }

    // --- 기존 인증 관련 로직 ---
    const token = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    const protectedRoutes = ['/my-page', '/write', '/admin'];
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !token && !refreshToken) {
        const loginUrl = new URL('/loginpage', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && pathname.startsWith('/loginpage')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // 모든 경로를 검사하도록 설정 (단, api, _next 등 제외)
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
