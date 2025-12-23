
"use client";
import React from 'react';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import Link from 'next/link';
import { useUserProfileStore } from '../store/userProfileStore';
import './globals.css';
import UserProfileCard from '../components/UserProfileCard';

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
  // JWT 유효성 검사 함수
  function isTokenValid(token: string | null): boolean {
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch {
      return false;
    }
  }


  // Zustand에서 프로필 상태 가져오기 (로그인 여부 확인용)
  const profile = useUserProfileStore((state) => state.profile);
  const setProfile = useUserProfileStore((state) => state.setProfile);

  // isLoggedIn을 상태로 관리
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);


  React.useEffect(() => {
    // 클라이언트에서만 localStorage 접근
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    setIsLoggedIn(isTokenValid(token) && !!profile);

    // profile이 null이고 토큰이 유효하면, 토큰에서 프로필 복원
    if (!profile && isTokenValid(token) && token) {
      try {
        const payload = token.split('.')[1];
        // base64 디코딩 (유니코드 안전)
        function base64DecodeUnicode(str: string) {
          return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        }
        const user = JSON.parse(base64DecodeUnicode(payload));
        if (user && user.email) {
          setProfile({
            name: user.name || '',
            nickname: user.nickname || '',
            email: user.email,
            bio: user.bio || '',
            profileImage: user.profileImage || '/icons/profile.svg',
            birthDate: user.birthDate || '',
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }, [profile]);

  // localStorage 토큰 변경 감지 (storage 이벤트 활용)
  React.useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(isTokenValid(token) && !!profile);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [profile]);

  // 프로필 아이콘 클릭 핸들러
  const handleProfileClick = () => {
    if (isLoggedIn) {
      window.location.href = '/my-page';
    } else {
      window.location.href = '/loginpage';
    }
  };

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
            <button
              type="button"
              onClick={handleProfileClick}
              className="focus:outline-none"
            >
              <Image src="/icons/profile.svg" alt="프로필" width={24} height={24} />
            </button>
            {/* 로그인을 하기 전에는 마이페이지를 보여주면 안됨 */}
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