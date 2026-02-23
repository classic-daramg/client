'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ComposerApiResponse {
    composerId: number;
    koreanName?: string;
    englishName?: string;
}

interface Composer {
    id: number;
    name: string;
}

interface ComposerSearchProps {
    onSelectComposer: (composers: Array<{ id: number; name: string }>) => void;
    onClose: () => void;
    initialSelected?: string[];
}

export default function ComposerSearch({
    onSelectComposer,
    onClose,
    initialSelected = []
}: ComposerSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedComposers, setSelectedComposers] = useState<string[]>(initialSelected);
    const [composers, setComposers] = useState<Composer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Apply Body Scroll Lock
    useBodyScrollLock(true);

    // API 연결 - 작곡가 목록 가져오기
    useEffect(() => {
        const fetchComposers = async () => {
            try {
                setLoading(true);
                const { data } = await apiClient.get('/composers');

                // API 응답을 Composer 형식으로 변환
                const formattedComposers = data.map((composer: ComposerApiResponse) => ({
                    id: composer.composerId,
                    name: composer.koreanName || composer.englishName || '알 수 없음',
                }));

                setComposers(formattedComposers);
                setError(null);
            } catch (err) {
                console.error('작곡가 목록 가져오기 실패:', err);
                setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchComposers();
    }, []);

    const filteredComposers = composers
        .filter(composer => composer.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aSelected = selectedComposers.includes(a.name);
            const bSelected = selectedComposers.includes(b.name);

            if (aSelected === bSelected) {
                return 0;
            }

            return aSelected ? -1 : 1;
        });

    const handleComposerClick = (composerName: string) => {
        if (selectedComposers.includes(composerName)) {
            setSelectedComposers(selectedComposers.filter(name => name !== composerName));
        } else {
            setSelectedComposers([...selectedComposers, composerName]);
        }
    };

    const handleComplete = () => {
        if (selectedComposers.length > 0) {
            const selected = selectedComposers
                .map(name => composers.find(c => c.name === name))
                .filter((c): c is Composer => c !== undefined);

            if (selected.length > 0) {
                onSelectComposer(selected);
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/20">
            <div className="bg-[#f4f5f7] w-full max-w-[375px] h-[100dvh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-white px-5 py-3 flex items-center sticky top-0 z-10 h-14 border-b border-[#f4f5f7]">
                    <button onClick={onClose} className="flex-shrink-0 touch-none">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h1 className="flex-1 text-[#1a1a1a] text-base font-semibold font-['Pretendard'] ml-1">작곡가 선택</h1>
                </div>

                {/* 작곡가 선택 헤더 */}
                <div className="bg-[#f4f5f7] px-5 py-3.5">
                    <p className="text-[#4c4c4c] text-xs font-medium font-['Pretendard']">작곡가 선택</p>
                </div>

                {/* 검색창 */}
                <div className="bg-white px-5 py-[18px] flex items-center gap-2.5">
                    <div className="flex-1 bg-[#f4f5f7] rounded-full px-3.5 py-2.5">
                        <input
                            type="text"
                            placeholder="작곡가명 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent text-sm font-medium font-['Pretendard'] text-[#1a1a1a] focus:outline-none placeholder-[#d9d9d9]"
                        />
                    </div>
                    <button
                        onClick={handleComplete}
                        className="bg-[#293a92] px-3.5 py-1.5 rounded-full touch-none active:opacity-80"
                    >
                        <span className="text-white text-[13px] font-semibold font-['Pretendard']">완료</span>
                    </button>
                </div>

                {/* 작곡가 리스트 */}
                <div className="bg-white flex-1 overflow-y-auto overscroll-contain">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-zinc-400 text-sm">로딩 중...</p>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    ) : filteredComposers.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-zinc-400 text-sm">작곡가를 찾을 수 없습니다.</p>
                        </div>
                    ) : (
                        filteredComposers.map((composer, index) => (
                            <button
                                key={composer.id}
                                onClick={() => handleComposerClick(composer.name)}
                                className={`w-full px-6 py-[18px] flex items-center justify-between border-t border-[#d9d9d9] ${index === 0 ? 'border-t-0' : ''
                                    } hover:bg-[#f4f5f7] transition-colors`}
                            >
                                <span className="text-[#1a1a1a] text-sm font-semibold font-['Pretendard']">
                                    {composer.name}
                                </span>
                                {selectedComposers.includes(composer.name) && (
                                    <div className="w-3 h-3 bg-[#293a92] rounded-full flex items-center justify-center">
                                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
