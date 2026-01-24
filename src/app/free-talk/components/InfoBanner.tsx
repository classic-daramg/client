'use client';

import Image from 'next/image';

export default function InfoBanner() {
  return (
    <div className="self-stretch px-6 py-7 bg-white flex flex-col justify-start items-start gap-3.5 overflow-hidden">
      <div className="relative w-full h-16">
        <Image
          src="/icons/freetalk-logo.svg"
          alt="자유 토크룸 로고"
          fill
          sizes="100%"
          className="object-contain object-left"
        />
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <div className="self-stretch text-neutral-600 text-sm font-semibold font-['Pretendard']">
          클래식부터 일상까지 자유롭게 이야기를 주고받는 공간
        </div>
        <div className="self-stretch text-zinc-300 text-xs font-medium font-['Pretendard']">
          이용수칙을 준수하여 자유롭게 다람쥐들과 대화를 나눠보세요.
        </div>
      </div>
    </div>
  );
}
