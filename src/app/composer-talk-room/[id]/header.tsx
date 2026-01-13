'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type HeaderProps = {
  onFilterClick: () => void;
};

export default function RoomHeader({ onFilterClick }: HeaderProps) {
  return (
    <header className="w-[375px] flex items-center px-5 mb-6">
      <Link href="/composer-talk">
        <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
      </Link>
      <div className="flex-grow text-left text-zinc-900 text-base font-semibold font-['Pretendard']">
        라흐마니노프 토크룸
      </div>
      <div className="w-6" /> {/* 균형을 위한 빈 공간 */}
      <div className="w-7 h-7 relative overflow-hidden">
        <Link href="/search">
          <Image src="/icons/search.svg" alt="검색" width={24} height={24} />
        </Link>
      </div>
      <button 
        onClick={onFilterClick}
        className="w-7 h-7 relative overflow-hidden"
      >
        <Image src="/icons/filter.svg" alt="필터" width={24} height={24} />
      </button>
    </header>
  );
}
