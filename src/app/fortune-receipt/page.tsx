"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Fortune {
  id: number;
  category: string;
  message: string;
  music: string;
  link: string;
}

export default function FortuneReceiptPage() {
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [totalFortunes, setTotalFortunes] = useState(200);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // JSON 파일 로드 및 오늘 날짜에 해당하는 운세 선택
    fetch('/fortune_data.json')
      .then((res) => res.json())
      .then((fortuneData: Fortune[]) => {
        const today = new Date();
        const dayOfYear = Math.floor(
          (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
        );
        const fortuneIndex = (dayOfYear - 1) % fortuneData.length;
        setFortune(fortuneData[fortuneIndex]);
        setTotalFortunes(fortuneData.length);
      })
      .catch((err) => console.error('Failed to load fortune data:', err));
  }, []);

  if (!mounted || !fortune) {
    return null;
  }

  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const fortuneNumber = String(fortune.id).padStart(6, '0');

  return (
    <div className="bg-[#F4F5F7] min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-center items-center px-5 pt-[54px] pb-4 relative">
        <Link href="/" className="absolute left-5 text-[#1A1A1A] text-lg font-semibold">
          ←
        </Link>
        <h1 className="text-[#1A1A1A] text-xl font-bold">도토리 운세</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Receipt Style Container */}
        <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-lg p-6 font-mono text-sm">
          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-[#BFBFBF]">
            <h2 className="text-[14px] font-semibold tracking-widest">DAILY DOTORI</h2>
            <p className="text-[12px] text-[#BFBFBF] mt-1">RECEIPT</p>
          </div>

          {/* Date and Number */}
          <div className="text-center py-3 border-b border-dashed border-[#BFBFBF] text-[12px] space-y-1">
            <p>DATE: {dateString}</p>
            <p>
              NO. : {fortuneNumber} / {String(totalFortunes).padStart(6, '0')}
            </p>
          </div>

          {/* Separator */}
          <div className="text-center py-3 border-b border-dashed border-[#BFBFBF]">
            <p className="text-[#BFBFBF]">-------------------------</p>
          </div>

          {/* Items */}
          <div className="py-4 border-b border-dashed border-[#BFBFBF] space-y-3">
            <div className="text-[12px] space-y-1">
              <div className="flex justify-between">
                <span>CATEGORY</span>
                <span>|</span>
              </div>
              <div className="text-right pr-1">
                <p className="font-semibold">{fortune.category}</p>
              </div>
            </div>

            <div className="text-[12px] space-y-1 mt-3">
              <div className="flex justify-between">
                <span>FORTUNE</span>
                <span>|</span>
              </div>
              <div className="text-right pr-1 max-w-[280px] ml-auto">
                <p className="text-[11px] leading-relaxed font-medium">{fortune.message}</p>
              </div>
            </div>

            <div className="text-[12px] space-y-1 mt-3">
              <div className="flex justify-between">
                <span>MUSIC</span>
                <span>|</span>
              </div>
              <div className="text-right pr-1 max-w-[280px] ml-auto">
                <p className="text-[11px] leading-relaxed font-medium">{fortune.music}</p>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="text-center py-3 border-b border-dashed border-[#BFBFBF]">
            <p className="text-[#BFBFBF]">-------------------------</p>
          </div>

          {/* Notice */}
          <div className="text-[11px] text-[#BFBFBF] space-y-1 py-3 border-b border-dashed border-[#BFBFBF]">
            <p>* 도토리는 하루에 하나만 깔 수 있습니다.</p>
            <p>* 행운의 음악을 듣고 아래에서 수다 떨기!</p>
          </div>

          {/* Separator */}
          <div className="text-center py-3">
            <p className="text-[#BFBFBF]">-------------------------</p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 pt-4">
            <Link href="/composer-talk">
              <button className="w-full py-3 px-4 bg-[#F4F5F7] rounded-lg text-[12px] font-semibold text-[#1A1A1A] hover:bg-[#E8EAF0] transition-colors">
                {'>> '} 작곡가별 토크룸으로 이동하기
              </button>
            </Link>
            <Link href="/curation">
              <button className="w-full py-3 px-4 bg-[#F4F5F7] rounded-lg text-[12px] font-semibold text-[#1A1A1A] hover:bg-[#E8EAF0] transition-colors">
                {'>> '} 큐레이션룸으로 이동하기
              </button>
            </Link>
            <Link href="/free-talk">
              <button className="w-full py-3 px-4 bg-[#F4F5F7] rounded-lg text-[12px] font-semibold text-[#1A1A1A] hover:bg-[#E8EAF0] transition-colors">
                {'>> '} 자유토크룸으로 이동하기
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
