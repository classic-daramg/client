'use client';

import Image from 'next/image';
import { useSafeBack } from '@/hooks/useSafeBack';

export default function ReportPage() {
  const handleSafeBack = useSafeBack('/');

  return (
    <div className="bg-[#f4f5f7] relative w-full max-w-md mx-auto min-h-screen flex flex-col">
      {/* Status Bar */}
      <div className="bg-white h-[54px] pt-[21px]" />

      {/* Header */}
      <div className="bg-white px-5 py-3 flex items-center gap-1 border-b border-[#f4f5f7]">
        <button
          onClick={handleSafeBack}
          className="flex-shrink-0 hover:opacity-70 transition"
        >
          <svg width="7" height="15" viewBox="0 0 7 15" fill="none" className="rotate-180">
            <path d="M1 1L6 7.5L1 14" stroke="#1A1A1A" strokeWidth="2" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-[#1a1a1a] text-[16px] font-semibold">
          신고하기
        </h1>
        <div className="w-6" />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#f4f5f7] px-5 py-8 flex flex-col items-center justify-center gap-8">
        {/* Squirrel Illustration */}
        <div className="w-[163px] h-[163px] bg-[#49579f] rounded-full flex items-center justify-center overflow-hidden">
          <Image
            src="/icons/윙크하는다람쥐.svg"
            alt="윙크다람쥐"
            width={163}
            height={163}
            className="object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-6">
          {/* Main Message */}
          <div className="text-center">
            <p className="text-[#4c4c4c] text-[18px] font-semibold leading-relaxed">
              신고하고 싶은 게시물/댓글을 캡쳐해<br />
              이메일로 보내주세요
            </p>
          </div>

          {/* Email */}
          <div className="text-center">
            <p className="text-[#a6a6a6] text-[16px] font-semibold">
              classicaldaramz@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px]" />
    </div>
  );
}
