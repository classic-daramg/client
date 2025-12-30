'use client';

import { useState, useEffect } from 'react';

// Mock data - 나중에 API로 교체 예정
const MOCK_COMPOSERS = [
    { id: 1, name: '작곡가명01' },
    { id: 2, name: '작곡가명02' },
    { id: 3, name: '작곡가명03' },
    { id: 4, name: '작곡가명04' },
    { id: 5, name: '작곡가명05' },
    { id: 6, name: '작곡가명06' },
    { id: 7, name: '작곡가명07' },
    { id: 8, name: '작곡가명08' },
    { id: 9, name: '작곡가명09' },
    { id: 10, name: '작곡가명10' },
];

interface Composer {
    id: number;
    name: string;
}

interface ComposerSearchProps {
    onSelectComposer: (composerName: string) => void;
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
    const [composers, setComposers] = useState<Composer[]>(MOCK_COMPOSERS);

    // TODO: API 연결 - 작곡가 목록 가져오기
    useEffect(() => {
        // 나중에 아래 주석을 해제하고 실제 API 호출로 대체
        /*
        const fetchComposers = async () => {
            try {
                const response = await fetch('/api/composers');
                const data = await response.json();
                setComposers(data);
            } catch (error) {
                console.error('작곡가 목록 가져오기 실패:', error);
            }
        };
        fetchComposers();
        */
    }, []);

    const filteredComposers = composers.filter(composer =>
        composer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleComposerClick = (composerName: string) => {
        if (selectedComposers.includes(composerName)) {
            setSelectedComposers(selectedComposers.filter(name => name !== composerName));
        } else {
            setSelectedComposers([...selectedComposers, composerName]);
        }
    };

    const handleComplete = () => {
        if (selectedComposers.length > 0) {
            const displayText = selectedComposers.length === 1 
                ? selectedComposers[0] 
                : `${selectedComposers[0]} 외 ${selectedComposers.length - 1}인`;
            onSelectComposer(displayText);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center">
            <div className="bg-[#f4f5f7] w-[375px] h-screen max-h-screen overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="bg-white px-5 py-3 flex items-center sticky top-0 z-10 h-14">
                    <button onClick={onClose} className="flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className="flex-1 text-[#1a1a1a] text-base font-semibold font-['Pretendard'] ml-1">글쓰기</h1>
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
                        className="bg-[#293a92] px-3.5 py-1.5 rounded-full"
                    >
                        <span className="text-white text-[13px] font-semibold font-['Pretendard']">완료</span>
                    </button>
                </div>

                {/* 작곡가 리스트 */}
                <div className="bg-white flex-1 overflow-y-auto">
                    {filteredComposers.map((composer, index) => (
                        <button
                            key={composer.id}
                            onClick={() => handleComposerClick(composer.name)}
                            className={`w-full px-6 py-[18px] flex items-center justify-between border-t border-[#d9d9d9] ${
                                index === 0 ? 'border-t-0' : ''
                            } hover:bg-[#f4f5f7] transition-colors`}
                        >
                            <span className="text-[#1a1a1a] text-sm font-semibold font-['Pretendard']">
                                {composer.name}
                            </span>
                            {selectedComposers.includes(composer.name) && (
                                <div className="w-3 h-3 bg-[#293a92] rounded-full flex items-center justify-center">
                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
