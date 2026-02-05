'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

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
    // TODO: 규칙 모달 열기 / 페이지 이동 등 원하는 동작 연결
    console.log('이용수칙 버튼 클릭');
  };

  return (
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
  );
}
