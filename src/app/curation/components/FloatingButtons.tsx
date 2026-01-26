'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function FloatingButtons() {
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 글쓰기 버튼 - 중앙 하단 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10">
        <button 
          onClick={() => router.push('/write?type=curation')}
          className="px-6 py-3 bg-blue-900 rounded-full shadow-lg flex items-center gap-1.5"
        >
          <Image src="/icons/write-white.svg" alt="글쓰기" width={24} height={24} />
          <span className="text-white text-base font-semibold">글쓰기</span>
        </button>
      </div>
      
      {/* 맨 위로 버튼 - 오른쪽 하단 */}
      <div className="fixed bottom-10 right-5 z-10">
        <button
          onClick={scrollToTop}
          className="p-3 bg-white rounded-full shadow-lg"
        >
          <Image src="/icons/top.svg" alt="맨 위로" width={24} height={24} />
        </button>
      </div>
    </>
  );
}
