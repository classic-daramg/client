'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
const UserProfileSection = () => (
  <div className="px-5 pt-5 pb-8 bg-white shadow-[0px_0px_7px_-3px_rgba(0,0,0,0.15)] flex items-center gap-3.5">
    <div className="flex flex-col items-center gap-2">
      <Image
        className="w-24 h-24 rounded-full"
        src="/icons/DefaultImage.svg"
        alt="프로필 이미지"
        width={96}
        height={96}
      />
      <Link href="/my-page/edit-profile" className="text-neutral-400 text-xs font-semibold flex items-center gap-1">
        프로필 편집
        <Image src="/icons/write.svg" alt="편집" width={12} height={12} />
      </Link>
    </div>
    <div className="flex-1 flex flex-col gap-4">
      <div>
        <h2 className="text-zinc-900 text-xl font-semibold">사용자닉네임</h2>
        <p className="text-neutral-400 text-xs font-medium">프로필 한줄소개가 들어갈 자리</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <button className="w-full h-7 px-3 py-1.5 bg-blue-900 rounded-[50px] inline-flex justify-center items-center gap-1 text-gray-100 text-xs font-semibold">
          도토리 친구 목록
          <Image src="/icons/back.svg" alt="" width={8} height={8} className="transform rotate-180 filter-white" />
        </button>
        <button className="w-full h-7 px-3 py-1.5 bg-white rounded-[50px] border border-zinc-300 inline-flex justify-center items-center gap-1 text-neutral-600 text-xs font-semibold">
          칭호 목록
          <Image src="/icons/back.svg" alt="" width={8} height={8} className="transform rotate-180" />
        </button>
      </div>
    </div>
  </div>
);

// Section Header for the List
const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-5 py-3.5 bg-gray-100 text-neutral-600 text-xs font-medium">
    {title}
  </div>
);

// List Item for Settings
const ListItem = ({ title, href }: { title: string; href: string }) => (
  <>
    <Link href={href} className="px-5 py-4 bg-white flex items-center">
      <span className="flex-1 text-neutral-600 text-sm font-semibold">{title}</span>
    </Link>
    <div className="h-px bg-neutral-100" />
  </>
);


// --- Main MyPage Component ---
export default function MyPage() {
  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 min-h-screen">
      <Header />
      <UserProfileSection />

      {/* Settings List */}
      <div className="flex flex-col">
        <SectionHeader title="계정 관련" />
        <ListItem title="이메일 변경" href="/my-page/change-email" />
        <ListItem title="비밀번호 변경" href="/my-page/change-password" />

        <SectionHeader title="게시글 관련" />
        <ListItem title="작성한 글" href="/my-page/posts" />
        <ListItem title="임시저장한 글" href="/my-page/drafts" />
        <ListItem title="스크랩한 글" href="/my-page/scraps" />

        <SectionHeader title="이용안내" />
        <ListItem title="이용 제한 내역" href="/my-page/restrictions" />
        <ListItem title="FAQ 및 문의하기" href="/my-page/faq" />
        <ListItem title="공지사항" href="/my-page/notices" />
        <ListItem title="서비스 이용약관" href="/my-page/terms" />
        <ListItem title="개인정보 처리방침" href="/my-page/privacy" />

        <SectionHeader title="기타" />
        <ListItem title="알림설정" href="/my-page/notifications" />
        <ListItem title="회원탈퇴" href="/my-page/delete-account" />
        <ListItem title="로그아웃" href="/my-page/logout" />
      </div>
    </div>
  );
}
