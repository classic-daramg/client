'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface HeaderProps {
  title?: string;
  /** 기본: history back */
  onBack?: () => void;
  /** 신고 아이콘 표시 여부 */
  showReport?: boolean;
  /** 신고 클릭 핸들러 (모달 열기 등) */
  onReportClick?: () => void;
  /** 추가 클래스 */
  className?: string;
  /** 상단 고정 여부 */
  sticky?: boolean;
}

/**
 * 자유 토크룸 헤더 (디자인 시안 반영)
 * - 폭 고정 384px (w-96)
 * - 좌: 뒤로가기 / 중앙: 타이틀 / 우: 신고 버튼 (옵션)
 * - 넓은 터치 영역 (38~44px) 확보
 */
export default function Header({
  title = '자유 토크룸',
  onBack,
  showReport = false,
  onReportClick,
  className,
  sticky = false
}: HeaderProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) return onBack();
    router.push('/');
  }, [onBack, router]);

  const handleReport = useCallback(() => {
    onReportClick?.();
  }, [onReportClick]);

  const headerClass = [
    'w-full flex justify-center bg-white',
    sticky ? 'sticky top-0 z-40 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]' : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <header
      className={headerClass}
      style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
    >
      <div className="w-96 px-5 h-14 flex items-center gap-1 select-none">
        {/* Back Button */}
        <button
          type="button"
            onClick={handleBack}
          aria-label="뒤로가기"
          className="relative w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {/* inline svg (left arrow) */}
          <svg width="18" height="18" viewBox="0 0 30 30" fill="none" aria-hidden="true">
            <path d="M18 22L11 14.5L18 7" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="flex-1 text-center text-zinc-900 text-base font-semibold tracking-tight leading-none">
          {title}
        </h1>

        {/* Report (optional) */}
        {showReport ? (
          <button
            type="button"
            onClick={handleReport}
            aria-label="신고"
            className="relative w-9 h-9 -mr-1 flex items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 15h2v-2h-2v2Zm0-4h2V7h-2v6Z" fill="#1A1A1A" />
            </svg>
          </button>
        ) : (
          // 공간 유지 (정렬 균형) - 필요 없으면 빈 div 제거 가능
          <div className="w-9 h-9 -mr-1" />
        )}
      </div>
    </header>
  );
}
