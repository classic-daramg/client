'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useScrollLock } from '@/hooks/useScrollLock';

const COMMUNITY_RULES = {
  title: '커뮤니티 이용수칙',
  content: `안녕하세요, <클래식 듣는 다람쥐> 운영팀입니다.
우리 서비스는 클래식 음악을 사랑하는 분들이 모여 서로의 감상을 나누는 소중한 공간입니다. 이용약관 및 개인정보처리방침에 근거하여, 모두가 쾌적하게 이용할 수 있는 자유게시판 수칙을 안내드립니다.

1. 게시판에서 금지되는 행위
2. 아래 항목에 해당하는 게시물이나 댓글은 사전 예고 없이 삭제될 수 있으며, 이용 제재의 대상이 됩니다.
3. 저작권 침해: 외부 공개가 금지된 공연의 영상 촬영/녹음본 업로드 및 제3자의 지적재산궈 침해 금지
4. 타인 비방 및 명예훼손: 특정 회원, 연주자, 제3자에 대한 비하, 욕설, 업무 방해 행위 금지
5. 부적절한 콘텐츠: 외설적이거나 폭력적인 메시지, 공공질서에 반하는 게시물, 도배성 게시물, 광고성 정보 송신 행위 금지
6. 정보 도용: 타인의 명의나 정보를 도용하여 게시물을 작성하는 행위 금지
7. 위반 시 조치 안내
8. 운영팀은 모니터링 및 회원 신고를 통해 부정행위를 적발하며, 아래 기준에 따라 제재를 부과합니다.
9. 1회 적발 시 게시물 및 댓글 작성 7일 제한
10. 2회 적발 시 게시물 및 댓글 작성 14일 제한
11. 3회 적발 시 소명 기회 부여 및 최종 회원탈퇴 처분
12. 3회 적발 시 가입 이메일로 제재 사실을 통지합니다.
13. 통지 후 30일간 소명 기회를 드립니다.
14. 기한 내 소명이 없거나 부적절한 경우 회원 자격이 상실(강제 탈퇴)될 수 있습니다.
15. 서비스 질서 유지 및 부정이용 방지를 위해, 탈퇴 후 31일간 동일한 이메일로 재가입이 불가능합니다.
16. 탈퇴 후 31일간 재가입 제한 확인을 위해 이메일 주소 및 징계 기록이 안전하게 보존된 후 파기됩니다
여러분이 나누어 주시는 모든 이야기가 클듣다 커뮤니티의 가장 아름다운 선율입니다. 클듣다 운영팀은 회원님들이 쾌적한 환경에서 맘껏 소통하실 수 있도록 최선을 다하겠습니다.
<클래식 듣는 다람쥐> 운영팀 드림`,
};

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  useScrollLock(isRulesModalOpen);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // 검색어가 비어있으면 쿼리 제거
    if (!searchTerm.trim()) {
      router.push('/free-talk');
    } else {
      router.push(`/free-talk?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    router.push('/free-talk');
  };

  const handleRulesClick = () => {
    setIsRulesModalOpen(true);
  };

  const closeRulesModal = () => {
    setIsRulesModalOpen(false);
  };

  return (
    <>
      <div className="self-stretch py-2.5 bg-white flex justify-center items-center">
        <div className="w-full px-5 inline-flex justify-center items-start gap-1.5">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="px-2.5 py-[5px] bg-gray-100 rounded-[100px] flex justify-start items-center gap-2 overflow-hidden hover:bg-gray-200 transition-colors">
              <input
                type="text"
                placeholder="제목, 내용, 해시태그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium font-['Pretendard'] text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="w-5 h-5 relative flex items-center justify-center hover:opacity-70 transition-opacity text-gray-400"
                  aria-label="검색어 삭제"
                >
                  <Image src="/icons/close-white.svg" alt="삭제" width={20} height={20} />
                </button>
              )}
              <button
                type="submit"
                className="w-7 h-7 relative flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="검색"
              >
                <Image src="/icons/search.svg" alt="검색" width={24} height={24} priority />
              </button>
            </div>
          </form>
          <button
            type="button"
            onClick={handleRulesClick}
            aria-label="이용수칙 보기"
            className="w-10 h-10 rounded-full flex justify-center items-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            <Image
              src="/icons/rules_icon.svg"
              alt="이용수칙"
              width={27}
              height={27}
              priority
            />
          </button>
        </div>
      </div>

      {isRulesModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={closeRulesModal}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-[375px] bg-white rounded-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-[#e5e7eb] flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[#1a1a1a]">{COMMUNITY_RULES.title}</h2>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-5 py-5 text-[#666666] whitespace-pre-wrap text-sm leading-relaxed -webkit-overflow-scrolling-touch" style={{ overscrollBehavior: 'contain' }}>
                {COMMUNITY_RULES.content}
              </div>
              <div className="flex gap-3 px-5 py-4 border-t border-[#e5e7eb] bg-[#fafafa]">
                <button
                  onClick={closeRulesModal}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white bg-[#293A92] hover:bg-[#1f2d7a] active:bg-[#182157] transition"
                  aria-label="모달 닫기"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
