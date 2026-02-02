import Link from 'next/link';
import Image from 'next/image';
import { useComposerStore } from '@/store/composerStore';

export default function FloatingButtons() {
    const { selectedComposer } = useComposerStore();
    
    // 선택된 작곡가 이름 (한글명 우선, 없으면 영문명)
    const composerName = selectedComposer?.koreanName || selectedComposer?.englishName || '';
    const composerId = selectedComposer?.composerId;

    return (
        <>
            {/* Write Button */}
            <Link href={`/write?composerId=${composerId}&composer=${encodeURIComponent(composerName)}`}>
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-900 rounded-full shadow-lg flex justify-center items-center gap-1.5 z-10">
                    <Image src="/icons/write-white.svg" alt="글쓰기" width={24} height={24} />
                    <span className="text-white text-base font-semibold">글쓰기</span>
                </div>
            </Link>

            {/* Scroll to Top Button */}
        </>
    );
}