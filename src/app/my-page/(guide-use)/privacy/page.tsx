'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white">
        <div className="h-[21px]" /> {/* Status bar space */}
        <div className="px-5 pb-3 flex items-center gap-1">
          <Link href="/my-page" className="w-5 h-5 flex items-center justify-center">
            <Image src="/icons/back.svg" alt="뒤로가기" width={20} height={20} />
          </Link>
          <h1 className="flex-1 text-[#1a1a1a] text-base font-semibold">
            개인정보처리방침
          </h1>
        </div>
      </header>

      {/* Divider */}
      <div className="h-2.5 bg-[#f4f5f7]" />

      {/* Content */}
      <div className="px-5 pt-[15px]">
        <div className="flex flex-col gap-2.5">
          {/* Title */}
          <h2 className="text-[#4c4c4c] text-sm font-semibold">
            개인정보처리방침
          </h2>

          {/* Content Box */}
          <div className="bg-[#f4f5f7] rounded-md p-3.5">
            <p className="text-[#a6a6a6] text-xs font-medium leading-normal whitespace-pre-line">
              {`이용약관 전문
              나대지 말것
              까불지 말것
              적당히 글만 쓸것 이상

-- 전문 내용 작성`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
