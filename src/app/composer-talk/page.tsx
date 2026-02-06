'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import HeartButton from './heart-button';
import { getApiUrl } from '@/lib/api';
import Link from 'next/link';
import { useComposerTalk } from './context';
import { useComposerStore } from '@/store/composerStore';

export default function ComposerTalkPage() {
    const { searchTerm, filters } = useComposerTalk();
    const { composers, setComposers, selectComposer } = useComposerStore();
    const [likedComposers, setLikedComposers] = React.useState<number[]>([]);

    // API 호출하여 작곡가 목록 가져오기 (필터 적용)
    useEffect(() => {
        const fetchComposers = async () => {
            try {
                // 쿼리 파라미터 생성
                const params = new URLSearchParams();
                if (filters.era.length > 0) {
                    params.append('eras', filters.era.join(','));
                }
                if (filters.continent.length > 0) {
                    params.append('continents', filters.continent.join(','));
                }

                const url = getApiUrl(`/composers${params.toString() ? '?' + params.toString() : ''}`);
                const response = await fetch(url);
                const data = await response.json();
                setComposers(data);
            } catch (error) {
                console.error('작곡가 목록 조회 실패:', error);
            }
        };

        fetchComposers();
    }, [setComposers, filters]);

    // 좋아요 토글 핸들러
    const handleLikeToggle = (composerId: number) => {
        setLikedComposers((prev) =>
            prev.includes(composerId)
                ? prev.filter((id) => id !== composerId)
                : [...prev, composerId]
        );
    };

    // API에서 필터링된 데이터 사용 (검색어만 클라이언트에서 필터링)
    const filteredCards = composers
        .filter((composer) => {
            // 검색어 필터링
            const matchesSearch = searchTerm === '' ||
                composer.koreanName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            // 좋아요한 작곡가를 상단에 배치
            const aLiked = likedComposers.includes(a.composerId);
            const bLiked = likedComposers.includes(b.composerId);
            return aLiked ? -1 : bLiked ? 1 : 0;
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
                    <div className="self-stretch text-right justify-center text-zinc-300 text-xs font-medium font-['Pretendard'] mt-1">다람쥐 여러분, 누구나 이곳에서 큐레이터가 될 수 있습니다.<br/>자신의 이야기를 담아 곡과 음반, 영상을 추천해보세요.</div>
                </div>
            </div>

            {/* 카드 목록 (스크롤 영역) */}
            <div className="flex flex-col gap-4 pb-8">
                {filteredCards.length === 0 ? (
                    <div className="text-center py-12">
                        <p className='text-gray-500 text-sm'>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    filteredCards.map((composer) => (
                        <Link
                            key={composer.composerId}
                            href={`/composer-talk-room/${composer.composerId}`}
                            onClick={() => selectComposer(composer.composerId)}
                        >
                            <div className="p-6 bg-white rounded-2xl shadow-sm flex justify-between items-center gap-5">
                                <div className="flex flex-col gap-0.5 flex-grow">
                                    <div className="text-stone-300 text-xs font-semibold">{composer.bio}</div>
                                    <div className="text-zinc-900 text-xl font-semibold">{composer.koreanName}</div>
                                </div>
                                <HeartButton
                                    isSelected={likedComposers.includes(composer.composerId)}
                                    onToggle={() => handleLikeToggle(composer.composerId)}
                                />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
};