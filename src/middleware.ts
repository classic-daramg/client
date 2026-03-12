import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 사용자의 브라우저 쿠키에서 토큰 조회
    const token = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // 인증이 필수적인 Private 라우트 목록
    const protectedRoutes = ['/my-page', '/write'];

    // 현재 접근하려는 URL이 보호된 라우트인지 확인
    const isProtectedRoute = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    // 보호된 라우트에 액세스/리프레시 토큰이 모두 없이 접근 시도 -> 로그인 페이지로 즉각 추방
    // 리프레시 토큰이 있다면 일단 통과시키고 클라이언트 사이드(AuthProvider/apiClient)에서 토큰 갱신을 시도하도록 함
    if (isProtectedRoute && !token && !refreshToken) {
        const loginUrl = new URL('/loginpage', request.url);
        // [보너스 UX] 로그인 완료 후 원래 가려던 페이지로 돌려보내기 위한 파라미터 삽입
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 로그인 된 유저가 /loginpage 로 가려고 하면 대시보드로 리다이렉트 (선택사항)
    if (token && request.nextUrl.pathname.startsWith('/loginpage')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// 미들웨어가 실행될 경로를 최소화하여 퍼포먼스 최적화
export const config = {
    matcher: ['/my-page/:path*', '/write/:path*', '/loginpage'],
};
