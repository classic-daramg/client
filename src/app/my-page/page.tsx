'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useUserProfileStore } from '@/store/userProfileStore';

// --- Reusable Components for the New Design ---

// Header Component
const Header = () => (
  <header className="bg-white">
    {/* This div is for the top safe area, can be adjusted */}
    <div className="h-5" />
    <div className="px-5 pb-3 flex items-center gap-1">
      <Link href="/" className="w-5 h-5 flex items-center justify-center">
        <Image src="/icons/back.svg" alt="뒤로가기" width={20} height={20} />
      </Link>
      <h1 className="flex-1 text-center text-zinc-900 text-base font-semibold">
        마이 페이지
      </h1>
      <div className="w-5 h-5" /> {/* Spacer to keep title centered */}
    </div>
  </header>
);

// User Profile Section
const UserProfileSection = () => {
  const profile = useUserProfileStore((state) => state.profile);
  const nickname = profile?.nickname || '사용자닉네임';
  const bio = profile?.bio || '프로필 한줄소개가 들어갈 자리';
  const profileImage = profile?.profileImage || '/icons/DefaultImage.svg';

  return (
    <div className="bg-white flex flex-col items-start pb-[34px] pt-[20px] px-[20px] shadow-[0px_0px_7px_-3px_rgba(0,0,0,0.15)]">
      <div className="flex gap-[14px] items-start w-full">
        {/* Profile Image */}
        <div className="flex flex-col items-center shrink-0 size-[86px]">
          <div className="relative rounded-[100px] shrink-0 w-full h-full">
            <Image
              className="rounded-full object-cover w-full h-full"
              src={profileImage}
              alt="프로필 이미지"
              width={96}
              height={96}
              priority
            />
          </div>
        </div>

        {/* Profile Info and Edit Button */}
        <div className="flex flex-1 flex-col gap-[18px] items-start leading-none">
          {/* Nickname and Bio */}
          <div className="flex flex-col gap-[9px] items-start w-full">
            <h2 className="text-zinc-900 text-[20px] font-semibold">{nickname}</h2>
            <p className="text-neutral-400 text-[12px] font-medium">{bio}</p>
          </div>

          {/* Edit Profile Button */}
          <Link
            href="/my-page/edit-profile"
            className="text-neutral-400 text-[12px] font-semibold flex items-center gap-2"
          >
            <Image src="/icons/write.svg" alt="편집" width={10} height={10} />
            프로필 편집
          </Link>
        </div>
      </div>
    </div>
  );
};

// Section Header for the List
const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-5 py-3.5 bg-gray-100 text-neutral-600 text-xs font-medium">
    {title}
  </div>
);

// List Item for Settings
const ListItem = ({ title, href, onClick }: { title: string; href?: string; onClick?: () => void }) => (
  <>
    {href ? (
      <Link href={href} className="px-5 py-4 bg-white flex items-center">
        <span className="flex-1 text-neutral-600 text-sm font-semibold">{title}</span>
      </Link>
    ) : (
      <button onClick={onClick} className="px-5 py-4 bg-white flex items-center w-full text-left">
        <span className="flex-1 text-neutral-600 text-sm font-semibold">{title}</span>
      </button>
    )}
    <div className="h-px bg-neutral-100" />
  </>
);

// Logout Confirmation Popup
const LogoutPopup = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
    <div className="bg-white flex flex-col gap-2.5 items-center justify-center pb-4 pt-5 px-7 rounded-[20px] shadow-[0px_0px_10px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col items-center justify-center px-0 py-5 w-full">
        <p className="text-[#4c4c4c] text-base font-semibold text-center w-[216px]">
          로그아웃 하시겠습니까?
        </p>
      </div>
      <div className="flex gap-1.5 w-full">
        <button
          onClick={onCancel}
          className="flex-1 bg-white border border-[#d9d9d9] flex items-center justify-center px-3.5 py-1.5 rounded-[50px]"
        >
          <span className="text-[#4c4c4c] text-xs font-semibold">취소</span>
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-[#293a92] flex items-center justify-center px-3.5 py-1.5 rounded-[50px]"
        >
          <span className="text-white text-xs font-semibold">로그아웃</span>
        </button>
      </div>
    </div>
  </div>
);


// --- Main MyPage Component ---
export default function MyPage() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const router = useRouter();
  const { clearProfile } = useUserProfileStore();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(getApiUrl('/users'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          useUserProfileStore.setState({
            profile: {
              name: data.name ?? '',
              nickname: data.nickname ?? '',
              email: data.email ?? '',
              bio: data.bio ?? '',
              profileImage: data.profileImage ?? '/icons/DefaultImage.svg',
              birthDate: data.birthDate ?? '',
            },
          });
        } else if (response.status === 401) {
          // 인증 실패 - 토큰 만료 또는 유효하지 않음
          console.error('인증이 만료되었습니다. 다시 로그인 해주세요.');
          localStorage.removeItem('authToken');
          useUserProfileStore.setState({ profile: null });
          router.push('/loginpage');
        } else {
          console.error('프로필 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('프로필 조회 에러:', error);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청 (인증 쿠키 삭제)
      const response = await fetch(getApiUrl('/auth/logout'), {
        method: 'DELETE',
        credentials: 'include', // 쿠키를 함께 전송
      });

      if (!response.ok) {
        console.error('로그아웃 API 실패:', response.status);
      }

      // 로컬 상태 초기화
      localStorage.removeItem('authToken');
      clearProfile();
      setShowLogoutPopup(false);
      router.push('/loginpage');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      localStorage.removeItem('authToken');
      clearProfile();
      setShowLogoutPopup(false);
      router.push('/loginpage');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 min-h-screen font-['Pretendard']">
      <Header />
      <UserProfileSection />

      {/* Settings List */}
      <div className="flex flex-col">
        <SectionHeader title="계정 관련" />
        <ListItem title="이메일 변경" href="/my-page/change-email" />
        <ListItem title="비밀번호 변경" href="/my-page/change-password" />

        <SectionHeader title="게시글 관련" />
        <ListItem title="작성한 글" href="/my-page/my-posts" />
        <ListItem title="임시저장한 글" href="/my-page/drafts" />
        <ListItem title="스크랩한 글" href="/my-page/scraps" />

        <SectionHeader title="이용안내" />
        <ListItem title="이용 제한 안내" href="/my-page/restrictions" />
        <ListItem title="FAQ 및 문의하기" href="/my-page/faq" />
        <ListItem title="공지사항" href="/my-page/notices" />
        <ListItem title="서비스 이용약관" href="/my-page/terms" />
        <ListItem title="개인정보 처리방침" href="/my-page/privacy" />

        <SectionHeader title="기타" />
        <ListItem title="알림설정" href="/my-page/notification-setting" />
        <ListItem title="회원탈퇴" href="/my-page/delete-account" />
        <ListItem title="로그아웃" onClick={() => setShowLogoutPopup(true)} />
      </div>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <LogoutPopup
          onCancel={() => setShowLogoutPopup(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
