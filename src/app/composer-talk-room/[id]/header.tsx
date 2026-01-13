'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type HeaderProps = {
  onFilterClick: () => void;
  composerName?: string;
};

export default function RoomHeader({ onFilterClick, composerName }: HeaderProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchClick = () => {
    setIsSearching(true);
  };

  const handleBackClick = () => {
    if (isSearching) {
      setIsSearching(false);
      setSearchValue('');
    }
  };

  return (
    <header className="w-[375px] flex items-center px-5 mb-6">
      <Link href="/composer-talk" onClick={handleBackClick}>
        <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
      </Link>
      
      {isSearching ? (
        <input
          type="text"
          placeholder="검색"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          autoFocus
          className="flex-grow ml-3 px-4 py-2 bg-[#f4f5f7] rounded-full text-zinc-900 text-base font-semibold outline-none placeholder-zinc-400"
        />
      ) : (
        <div className="flex-grow text-left text-zinc-900 text-base font-semibold font-['Pretendard']">
          {composerName ? `${composerName} 토크룸` : '토크룸'}
        </div>
      )}
      
      <div className="w-6" /> {/* 균형을 위한 빈 공간 */}
      
      <button 
        onClick={isSearching ? handleBackClick : handleSearchClick}
        className="w-7 h-7 relative overflow-hidden"
      >
        <Image src="/icons/search.svg" alt="검색" width={24} height={24} />
      </button>
      
      <button 
        onClick={onFilterClick}
        className="w-7 h-7 relative overflow-hidden"
      >
        <Image src="/icons/filter.svg" alt="필터" width={24} height={24} />
      </button>
    </header>
  );
}
