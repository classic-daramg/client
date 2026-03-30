'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import HeartButton from './heart-button';
import Link from 'next/link';
import { useComposerTalk } from './context';
import { useComposerStore } from '@/store/composerStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';

const VISITED_KEY = 'composer_last_visited';

export default function ComposerTalkPage() {
    const { searchTerm, filters } = useComposerTalk();
    const { composers, setComposers, selectComposer } = useComposerStore();
    const [isClient, setIsClient] = useState(false);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

    useEffect(() => {
        setIsClient(true);
    }, []);

    // API 호출하여 작곡가 목록 가져오기 (필터 적용)
    useEffect(() => {
        const fetchComposers = async () => {
            try {
                const params = new URLSearchParams();
                if (filters.era.length > 0) {
                    params.append('eras', filters.era.join(','));
                }
                if (filters.continent.length > 0) {
                    params.append('continents', filters.continent.join(','));
                }

                const endpoint = `/composers${params.toString() ? '?' + params.toString() : ''}`;
                const response = await apiClient.get(endpoint);
                setComposers(response.data);
            } catch (error) {
                console.error('작곡가 목록 조회 실패:', error);
            }
        };

        fetchComposers();
    }, [setComposers, filters]);

    // 좋아요 토글 핸들러
    const handleLikeToggle = async (composerId: number) => {
        const prevComposers = composers;
        const updatedComposers = composers.map((composer) =>
            composer.composerId === composerId
                ? { ...composer, isLiked: !composer.isLiked }
                : composer
        );

        setComposers(updatedComposers);

        try {
            await apiClient.post(`/composers/${composerId}/like`);
        } catch (error) {
            console.error('작곡가 좋아요 토글 실패:', error);
            setComposers(prevComposers);
        }
    };

    // 마지막 방문 시각 조회 (로그인: localStorage, 비로그인: sessionStorage)
    const getLastVisitedAt = useCallback((composerId: number): string | null => {
        if (!isClient) return null;
        const storage = isAuthenticated ? localStorage : sessionStorage;
        try {
            const stored = storage.getItem(VISITED_KEY);
            const visited = stored ? JSON.parse(stored) : {};
            return visited[composerId] ?? null;
        } catch {
            return null;
        }
    }, [isClient, isAuthenticated]);

    // N 뱃지 여부 계산 함수
    const hasNBadge = useCallback((composer: typeof composers[number]): boolean => {
        if (!isClient) return false;
        const lastVisitedAt = getLastVisitedAt(composer.composerId);
        return !!composer.lastStoryPostAt && (
            !lastVisitedAt ||
            new Date(composer.lastStoryPostAt) > new Date(lastVisitedAt)
        );
    }, [isClient, getLastVisitedAt]);

    // 정렬 우선순위: 하트+N(0) > 하트만(1) > N만(2) > 없음(3)
    const getSortPriority = (composer: typeof composers[number]): number => {
        const liked = composer.isLiked;
        const n = hasNBadge(composer);
        if (liked && n) return 0;
        if (liked) return 1;
        if (n) return 2;
        return 3;
    };

    // API에서 필터링된 데이터 사용 (검색어만 클라이언트에서 필터링)
    const filteredCards = composers
        .filter((composer) => {
            const matchesSearch = searchTerm === '' ||
                composer.koreanName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            const pa = getSortPriority(a);
            const pb = getSortPriority(b);
            if (pa !== pb) return pa - pb;
            // 동순위일 때: 태어난 년도 오름차순
            return a.birthYear - b.birthYear;
        });

    return (
        <div className="relative">

            {/* 작곡가 토크룸 소개 */}
            <div className="relative mt-1 mb-4 -mx-5 bg-white p-5 flex flex-col justify-between h-48">
                <div>
                    <Image src="/icons/logo_토크룸.svg" alt="토크룸 로고" width={195} height={48} />
                </div>
                <div className="text-right">
                    <div className="self-stretch text-right justify-center text-neutral-600 text-sm font-semibold font-['Pretendard']">나만의 이야기와 취향을 담아 클래식을 추천하는 공간</div>
                    <div className="self-stretch text-right justify-center text-zinc-300 text-xs font-medium font-['Pretendard'] mt-1">다람쥐 여러분, 누구나 이곳에서 큐레이터가 될 수 있습니다.<br />자신의 이야기를 담아 곡과 음반, 영상을 추천해보세요.</div>
                </div>
            </div>

            {/* 카드 목록 (스크롤 영역) */}
            <div className="flex flex-col gap-4 pb-8">
                {filteredCards.length === 0 ? (
                    <div className="text-center py-12">
                        <p className='text-gray-500 text-sm'>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    filteredCards.map((composer) => {
                        const showNBadge = hasNBadge(composer);
                        return (
                            <Link
                                key={composer.composerId}
                                href={`/composer-talk-room/${composer.composerId}`}
                                onClick={() => selectComposer(composer.composerId)}
                            >
                                <div className="p-6 bg-white rounded-2xl shadow-sm flex items-center gap-[19px]">
                                    <HeartButton
                                        isSelected={composer.isLiked}
                                        onToggle={() => handleLikeToggle(composer.composerId)}
                                    />
                                    <div className="flex flex-col gap-0.5 flex-grow">
                                        <div className="text-[#BFBFBF] text-xs font-semibold">{composer.bio}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-900 text-xl font-semibold">{composer.koreanName}</span>
                                            {showNBadge && (
                                                <div className="w-4 h-4 rounded-full bg-[#FF5D70] flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-[8px] font-semibold leading-none">N</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    )
};
