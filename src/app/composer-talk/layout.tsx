'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ComposerTalkProvider, useComposerTalk } from './context';
import Filter from './filter';

function ComposerTalkHeader({ children }: { children: React.ReactNode }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { 
        searchTerm, 
        setSearchTerm, 
        isFilterOpen, 
        setIsFilterOpen, 
        hasActiveFilters 
    } = useComposerTalk();

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setSearchTerm('');
        }
    };

    const handleFilterToggle = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    return (
        <div className="min-h-screen bg-[#f4f5f7] flex flex-col items-center py-8">
            {/* 상단 타이틀 */}
            <header className="w-[375px] flex items-center px-5 mb-1 relative">
                <Link href="/">
                    <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
                </Link>
                
                {/* 제목과 검색바 오버레이 */}
                <div className="flex-grow relative ml-2">
                    {/* 기본 제목 */}
                    <div className={`text-left text-zinc-900 text-base font-semibold font-['Pretendard'] transition-opacity duration-200 ${isSearchOpen ? 'opacity-0' : 'opacity-100'}`}>
                        작곡가별 토크룸
                    </div>
                    
                    {/* 검색바 오버레이 */}
                    {isSearchOpen && (
                        <div className="absolute inset-0 flex items-center">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="작곡가를 검색하세요"
                                className="w-full h-7 px-3 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:border-gray-200"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* 검색 및 필터 아이콘 */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSearchToggle}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="검색"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                            <path
                                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={handleFilterToggle}
                        className={`p-1 hover:bg-gray-100 rounded-full transition-colors ${hasActiveFilters ? 'text-blue-600' : 'text-zinc-600'}`}
                        aria-label="필터"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 7H21M6 12H18M10 17H14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </header>
            <main className="w-[375px] px-5 flex-1 overflow-y-auto relative">
                {children}
            </main>
            <Filter />
        </div>
    );
}

export default function ComposerTalkLayout({ children }: { children: React.ReactNode }) {
    return (
        <ComposerTalkProvider>
            <ComposerTalkHeader>
                {children}
            </ComposerTalkHeader>
        </ComposerTalkProvider>
    );
}