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
        <header className="bg-white py-2 px-4 flex justify-between items-center border-b sticky top-0 z-10 h-14">
            <button onClick={handleSafeBack}>
                <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
            </button>
            <h1 className="text-zinc-900 text-base font-semibold absolute left-1/2 -translate-x-1/2">글쓰기</h1>
            <div className="flex items-center gap-1.5">
                <button onClick={onSaveDraft} className="px-3 py-1.5 bg-white rounded-full border border-zinc-300 flex justify-center items-center gap-0.5">
                    <span className="text-neutral-400 text-xs font-semibold">임시저장</span>
                </button>
                <button onClick={onRegister} disabled={!isRegisterEnabled} className={`pl-3.5 pr-3 py-1.5 rounded-full flex justify-center items-center gap-0.5 ${isRegisterEnabled ? 'bg-blue-900' : 'bg-gray-300'}`}>
                    <span className="text-white text-xs font-semibold">등록</span>
                </button>
            </div>
        </header>
    );
}
