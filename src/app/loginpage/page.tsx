'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ToastNotification from '../../components/ToastNotification';
import { useUserProfileStore } from '../../store/userProfileStore';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../lib/apiClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setProfile = useUserProfileStore((state) => state.setProfile);
  const { setTokens } = useAuthStore();

  // JWT 토큰 디코딩 및 만료 확인 함수
  const checkTokenExpiration = (token: string): { isExpired: boolean; expiresAt?: Date; payload?: any } => {
    try {
      // JWT는 header.payload.signature 형식
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return { isExpired: true };
      }

      // payload 디코딩 (base64)
      const payload = JSON.parse(atob(parts[1]));
      console.log('Decoded JWT payload:', payload);

      // exp 필드 확인 (Unix timestamp in seconds)
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000); // 밀리초로 변환
        const now = new Date();
        const isExpired = now >= expirationDate;

        console.log('Token issued at (iat):', payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A');
        console.log('Token expires at (exp):', expirationDate.toLocaleString());
        console.log('Current time:', now.toLocaleString());
        console.log('Time until expiration:', isExpired ? 'EXPIRED' : `${Math.floor((expirationDate.getTime() - now.getTime()) / 1000 / 60)} minutes`);
        console.log('Is token expired?', isExpired ? '❌ YES' : '✅ NO');

        return { isExpired, expiresAt: expirationDate, payload };
      } else {
        console.warn('No expiration (exp) field in token - assuming valid');
        return { isExpired: false, payload };
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return { isExpired: true };
    }
  };

  const handleLogin = async () => {
    // 입력 검증
    if (!email.trim()) {
      setToast({ show: true, message: '이메일을 입력해주세요.' });
      return;
    }

    if (!password.trim()) {
      setToast({ show: true, message: '비밀번호를 입력해주세요.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      if (response.status === 200 || response.status === 201) {
        // 로그인 성공
        const data = response.data;
        
        // JWT 토큰 추출 및 저장
        const accessToken = data.accessToken || data.token;
        const refreshToken = data.refreshToken;
        
        if (!accessToken) {
          setToast({ show: true, message: '토큰을 받지 못했습니다. 다시 시도해주세요.' });
          setIsLoading(false);
          return;
        }

        // Zustand store에 토큰 저장 (메모리에 보관)
        setTokens(accessToken, refreshToken || null);

        // 쿠키에 access token 저장 (백엔드가 cookieAuth로 인증하므로 필수)
        if (typeof document !== 'undefined') {
          document.cookie = `access_token=${accessToken}; path=/; SameSite=Lax`;
        }

        console.log('=== JWT Token Saved to Memory & Cookie ===');
        console.log('Access Token length:', accessToken.length);
        console.log('Refresh Token:', refreshToken ? 'Present' : 'Not present (using cookie)');
        console.log('✅ Saved access_token to cookie for API requests');
        
        // 토큰 만료 정보 확인
        const tokenStatus = checkTokenExpiration(accessToken);
        if (tokenStatus.isExpired) {
          console.error('⚠️ Warning: Received token is already expired!');
        } else if (tokenStatus.expiresAt) {
          const minutesUntilExpiry = Math.floor((tokenStatus.expiresAt.getTime() - new Date().getTime()) / 1000 / 60);
          console.log(`✅ Token is valid for ${minutesUntilExpiry} minutes`);
        }
        console.log('=================================');

        // 사용자 정보 처리
        const userInfo = data.user || {};
        
        // localStorage에서 저장된 프로필 데이터 확인
        const savedProfile = localStorage.getItem('user-profile-storage');
        interface ProfileData {
          name?: string;
          nickname?: string;
          email?: string;
          bio?: string;
          profileImage?: string;
          birthDate?: string;
        }
        let profileData: ProfileData | null = null;

        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            profileData = parsed.state?.profile;
          } catch (error) {
            console.log('localStorage 프로필 파싱 실패:', error);
          }
        }

        // 프로필 설정: 저장된 데이터 우선, 없으면 응답 데이터 사용
        const profileToSet = {
          name: profileData?.name || userInfo?.name || '',
          nickname: profileData?.nickname || userInfo?.nickname || '',
          email: profileData?.email || userInfo?.email || email.trim(),
          bio: profileData?.bio || userInfo?.bio || '',
          profileImage: profileData?.profileImage || userInfo?.profileImage || '/icons/DefaultImage.svg',
          birthDate: profileData?.birthDate || userInfo?.birthdate || '',
        };

        setProfile(profileToSet);

        setToast({ show: true, message: '로그인되었습니다.' });
        setIsLoading(false);

        setTimeout(() => {
          router.push('/my-page');
        }, 500);
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      
      // Axios 에러 처리
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 401:
            setToast({ show: true, message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
            break;
          case 404:
            setToast({ show: true, message: '존재하지 않는 계정입니다.' });
            break;
          case 429:
            setToast({ show: true, message: '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.' });
            break;
          default:
            setToast({ show: true, message: errorData?.message || '로그인에 실패했습니다.' });
        }
      } else {
        setToast({ show: true, message: '네트워크 오류가 발생했습니다.' });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-[375px] h-[812px] bg-white mx-auto">
      {/* Status Bar */}
      <div className="flex flex-col items-start pt-[21px] w-full h-[54px] bg-white">
        {/* Status bar content would go here */}
      </div>

      {/* Header with Back Button */}
      <div className="flex flex-col items-start px-5 pb-3 gap-4 w-full h-[42px] bg-white">
        <div className="flex flex-row items-center gap-1 w-full h-[30px]">
          <Link href="/">
            <button className="w-5 h-5 flex items-center justify-center">
              <svg width="7" height="15" viewBox="0 0 7 15" fill="none" className="rotate-180">
                <path d="M1 1L6 7.5L1 14" stroke="#1A1A1A" strokeWidth="2"/>
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Logo Section */}
      <div className="absolute left-5 top-[104px]">
        <div className="relative w-[185.21px] h-[40px]">
          {/* Logo Image Component - replace with your logo */}
          <Link href="/">
            <Image
              src="/icons/logo.svg" // 로고 이미지 경로를 넣어주세요
              alt="클래식듣는다람쥐 로고"
              width={185}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>
      </div>

      {/* Login Form */}
      <div className="absolute left-5 top-[251px] w-[335px] h-[289px] flex flex-col items-center gap-6">
        {/* Input Fields */}
        <div className="flex flex-col items-start gap-2 w-full h-[104px]">
          {/* Email Input */}
          <div className="flex flex-row justify-end items-center px-5 py-[6px] gap-[2px] w-full h-12 bg-[#F4F5F7] rounded">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-[18px] bg-transparent font-pretendard font-semibold text-[15px] leading-[18px] text-[#4C4C4C] outline-none"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-row justify-end items-center px-5 py-[6px] gap-[2px] w-full h-12 bg-[#F4F5F7] rounded">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 h-[18px] bg-transparent font-pretendard font-semibold text-[15px] leading-[18px] text-[#4C4C4C] outline-none"
              placeholder="비밀번호를 입력하세요"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="w-4 h-4 flex items-center justify-center"
            >
              {showPassword ? (
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M8 0C4.5 0 1.73 2.11 1 5C1.73 7.89 4.5 10 8 10C11.5 10 14.27 7.89 15 5C14.27 2.11 11.5 0 8 0ZM8 8.33C6.06 8.33 4.5 6.77 4.5 4.83C4.5 2.89 6.06 1.33 8 1.33C9.94 1.33 11.5 2.89 11.5 4.83C11.5 6.77 9.94 8.33 8 8.33ZM8 2.5C6.62 2.5 5.5 3.62 5.5 5C5.5 6.38 6.62 7.5 8 7.5C9.38 7.5 10.5 6.38 10.5 5C10.5 3.62 9.38 2.5 8 2.5Z" fill="#4C4C4C"/>
                </svg>
              ) : (
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M8 0C4.5 0 1.73 2.11 1 5C1.73 7.89 4.5 10 8 10C11.5 10 14.27 7.89 15 5C14.27 2.11 11.5 0 8 0ZM8 8.33C6.06 8.33 4.5 6.77 4.5 4.83C4.5 2.89 6.06 1.33 8 1.33C9.94 1.33 11.5 2.89 11.5 4.83C11.5 6.77 9.94 8.33 8 8.33ZM8 2.5C6.62 2.5 5.5 3.62 5.5 5C5.5 6.38 6.62 7.5 8 7.5C9.38 7.5 10.5 6.38 10.5 5C10.5 3.62 9.38 2.5 8 2.5Z" fill="#4C4C4C"/>
                  <line x1="1" y1="1" x2="15" y2="11" stroke="#4C4C4C" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col items-start gap-3 w-full h-[120px]">
          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`flex flex-row justify-center items-center py-[5px] px-5 gap-[2px] w-full h-12 rounded-full transition-colors ${
              isLoading
                ? 'bg-[#A6A6A6] cursor-not-allowed'
                : 'bg-[#293A92] cursor-pointer hover:bg-[#1e2c73]'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-pretendard font-semibold text-base text-white">
                  로그인 중...
                </span>
              </div>
            ) : (
              <span className="w-[56px] h-[19px] font-pretendard font-semibold text-base leading-[19px] text-white cursor-pointer">
                로그인
              </span>
            )}
          </button>

          {/* Divider Line */}
          <div className="w-full h-0 border-t border-[#F5F5F5]"></div>

          {/* Sign Up Button */}
          <Link href="/loginpage/register">
            <button className="flex flex-row justify-center items-center py-[5px] px-5 gap-[2px] w-[335px] h-12 border border-[#293A92] rounded-full cursor-pointer">
              <span className="w-[64px] h-[19px] font-pretendard font-semibold text-base leading-[19px] text-[#293A92] cursor-pointer">
                회원가입
              </span>
            </button>
          </Link>
        </div>

        {/* Forgot Password Link */}
        <Link href="/loginpage/reset-password">
          <button className="w-full h-[17px] font-pretendard font-medium text-sm leading-[17px] text-center underline text-[#D9D9D9] cursor-pointer">
            비밀번호를 까먹었어요
          </button>
        </Link>
      </div>

      {/* Home Indicator (for iPhone) */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible"></div>

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
        duration={3000}
      />
    </div>
  );
};

export default LoginPage;