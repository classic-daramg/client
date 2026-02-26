// src/app/write/components/WriteHeader.tsx
'use client';

import Image from 'next/image';
import { useSafeBack } from '@/hooks/useSafeBack';

interface WriteHeaderProps {
    onSaveDraft: () => void;
    onRegister: () => void;
    isRegisterEnabled: boolean;
}

export default function WriteHeader({ onSaveDraft, onRegister, isRegisterEnabled }: WriteHeaderProps) {
    const handleSafeBack = useSafeBack('/');

    return (
        <header className="bg-white px-5 py-3 flex items-center sticky top-0 z-10 w-full border-b">
            <div className="flex items-center gap-1 w-full text-left">
                <button
                    type="button"
                    onClick={handleSafeBack}
                    className="flex-shrink-0"
                >
                    <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
                </button>
                <h1 className="flex-1 text-[#1a1a1a] text-base font-semibold font-['Pretendard'] ml-1">글쓰기</h1>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onSaveDraft}
                        className="px-3 py-1.5 bg-white rounded-full border border-[#d9d9d9] flex items-center gap-0.5"
                    >
                        <span className="text-[#a6a6a6] text-[13px] font-semibold font-['Pretendard']">임시저장</span>
                    </button>
                    <button
                        type="button"
                        onClick={onRegister}
                        disabled={!isRegisterEnabled}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-0.5 ${isRegisterEnabled ? 'bg-[#293a92]' : 'bg-[#bfbfbf]'}`}
                    >
                        <span className="text-white text-[13px] font-semibold font-['Pretendard']">
                            등록
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
