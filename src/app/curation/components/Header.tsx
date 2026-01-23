'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="flex items-center h-14 px-5 py-3">
        <button onClick={() => router.back()}>
          <Image src="/icons/back.svg" alt="뒤로가기" width={24} height={24} />
        </button>
        <h1 className="ml-4 text-base font-semibold text-zinc-900 text-left flex-1">
          다람쥐의 큐레이션
        </h1>
      </div>
    </header>
  );
}
