'use client';

/**
 * 페이지 전환 시 fade-in + slide-up 애니메이션을 적용하는 래퍼 컴포넌트
 * 사용법: 각 page.tsx에서 콘텐츠를 <PageTransition>으로 감싸기
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-enter">{children}</div>;
}
