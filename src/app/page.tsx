
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserProfileStore } from '../store/userProfileStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';

const menuItems = [
  {
    icon: '/icons/message.svg',
    title: '작곡가별 토크룸',
    description: '같은 작곡가를 사랑하는 사람들과 공감을 나누는 공간',
  },
  {
    icon: '/icons/music.svg',
    title: '다람쥐의 큐레이션',
    description: '나만의 이야기와 위로를 담아 클래식을 추천하는 공간',
  },
  {
    icon: '/icons/talkIcon.svg',
    title: '자유 토크룸',
    description: '클래식에 대한 자유로운 이야기와 소통의 공간',
  },
];

// Onboarding Modal Component


export default function HomePage() {
  const profile = useUserProfileStore((state) => state.profile);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 안읽은 알림 수 조회
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get<number>('/notifications/unread-count');
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // 마운트 후 안읽은 알림 수 조회 및 주기적 갱신
  useEffect(() => {
    if (!mounted) return;

    // 로그인한 경우에만 알림 수 조회
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    // 초기 로드
    fetchUnreadCount();

    // 30초마다 갱신
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [mounted, fetchUnreadCount]);

  // hydration이 끝난 후에만 isLoggedIn을 계산
  const isLoggedIn = mounted && profile !== null;

  if (!mounted) {
    // hydration 전에는 아무것도 렌더링하지 않음 (또는 로딩 스피너 등)
    return null;
  }

  return (
    <div className="bg-[#F4F5F7] min-h-screen">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-5 pt-[54px] pb-4">
        <Link href="/" className="flex items-center">
          <Image src="/icons/logo.svg" alt="다람쥐 로고" width={106} height={23} />
        </Link>

        <div className="flex items-center gap-[10px]">
          <Link href="/notification" className="relative">
            <Image src="/icons/alarm.svg" alt="알림" width={30} height={30} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href={isLoggedIn ? "/my-page" : "/loginpage"}>
            <Image
              src="/icons/profile.svg"
              alt="프로필"
              width={30}
              height={30}
              className={isLoggedIn ? "ring-2 ring-blue-500 rounded-full" : ""}
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 pt-0">
        <div className="flex flex-col gap-3">
          {/* Image Slide */}
          {/* Image Slide */}
          {/* Image Slide */}
          <Link href="/onboarding" className="w-full">
            <div className="w-full aspect-[335/148] relative rounded-[20px] overflow-hidden bg-white shadow-[0px_0px_7.1px_-3px_rgba(0,0,0,0.15)]">
              <Image
                src="/icons/onboarding_baner.png"
                alt="Onboarding Banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>

          {/* Menu Cards */}
          <Link href="/composer-talk">
            <div className="bg-white h-[143px] rounded-[20px] shadow-[0px_0px_7.1px_-3px_rgba(0,0,0,0.15)] p-6 flex flex-col justify-between cursor-pointer">
              <Image src={menuItems[0].icon} alt={menuItems[0].title} width={36} height={36} />
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-[2px]">
                  <h2 className="text-[#1A1A1A] text-[20px] font-semibold">{menuItems[0].title}</h2>
                  <p className="text-[#BFBFBF] text-[11px]">{menuItems[0].description}</p>
                </div>
                <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 7.5L1 14" stroke="#BFBFBF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/curation">
            <div className="bg-white h-[143px] rounded-[20px] shadow-[0px_0px_7.1px_-3px_rgba(0,0,0,0.15)] p-6 flex flex-col justify-between cursor-pointer">
              <Image src={menuItems[1].icon} alt={menuItems[1].title} width={36} height={36} />
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-[2px]">
                  <h2 className="text-[#1A1A1A] text-[20px] font-semibold">{menuItems[1].title}</h2>
                  <p className="text-[#BFBFBF] text-[11px]">{menuItems[1].description}</p>
                </div>
                <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 7.5L1 14" stroke="#BFBFBF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/free-talk">
            <div className="bg-white h-[143px] rounded-[20px] shadow-[0px_0px_7.1px_-3px_rgba(0,0,0,0.15)] p-6 flex flex-col justify-between cursor-pointer">
              <Image src={menuItems[2].icon} alt={menuItems[2].title} width={36} height={36} />
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-[2px]">
                  <h2 className="text-[#1A1A1A] text-[20px] font-semibold">{menuItems[2].title}</h2>
                  <p className="text-[#BFBFBF] text-[11px]">{menuItems[2].description}</p>
                </div>
                <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 7.5L1 14" stroke="#BFBFBF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}