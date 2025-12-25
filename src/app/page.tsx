
"use client";
import React, { useState, useEffect } from 'react';
import { useUserProfileStore } from '../store/userProfileStore';
import Link from 'next/link';
import Image from 'next/image';

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

export default function HomePage() {
  const profile = useUserProfileStore((state) => state.profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // hydration이 끝난 후에만 isLoggedIn을 계산
  const isLoggedIn = mounted && profile !== null;

  if (!mounted) {
    // hydration 전에는 아무것도 렌더링하지 않음 (또는 로딩 스피너 등)
    return null;
  }

  return (
    <>
      <header className="w-full flex justify-between items-center p-4 border-b">
        <Link href="/" className="flex items-center">
          <Image src="/icons/logo.svg" alt="다람쥐 로고" width={120} height={40} />
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/notification">
            <Image src="/icons/alarm.svg" alt="알림" width={24} height={24} />
          </Link>
          <Link href={isLoggedIn ? "/my-page" : "/loginpage"}>
            <Image
              src="/icons/profile.svg"
              alt="프로필"
              width={24}
              height={24}
              className={isLoggedIn ? "ring-2 ring-blue-500 rounded-full" : ""}
            />
          </Link>
        </div>
      </header>
      <div className="p-4">
        <div className="space-y-3">
          <div className="w-full h-54 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-semibold">
            IMAGE
          </div>
          <div>
            <Link href="/composer-talk">
              <div className="flex items-center p-5 bg-gray-50 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <Image src={menuItems[0].icon} alt={menuItems[0].title} width={40} height={40} />
                <div className="ml-4 flex-grow">
                  <h2 className="font-bold text-lg transition-colors duration-200 hover:text-blue-600">{menuItems[0].title}</h2>
                  <p className="text-sm text-gray-500">{menuItems[0].description}</p>
                </div>
                <span className="text-gray-400">&gt;</span>
              </div>
            </Link>
          </div>
          <div>
            <Link href="/curation">
              <div className="flex items-center p-5 bg-gray-50 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <Image src={menuItems[1].icon} alt={menuItems[1].title} width={40} height={40} />
                <div className="ml-4 flex-grow">
                  <h2 className="font-bold text-lg transition-colors duration-200 hover:text-blue-600">{menuItems[1].title}</h2>
                  <p className="text-sm text-gray-500">{menuItems[1].description}</p>
                </div>
                <span className="text-gray-400">&gt;</span>
              </div>
            </Link>
          </div>
          <div>
            <Link href="/free-talk">
              <div className="flex items-center p-5 bg-gray-50 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <Image src={menuItems[2].icon} alt={menuItems[2].title} width={40} height={40} />
                <div className="ml-4 flex-grow">
                  <h2 className="font-bold text-lg transition-colors duration-200 hover:text-blue-600">{menuItems[2].title}</h2>
                  <p className="text-sm text-gray-500">{menuItems[2].description}</p>
                </div>
                <span className="text-gray-400">&gt;</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* // ...existing code... */}
    </>
  );
}