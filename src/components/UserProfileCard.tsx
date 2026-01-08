'use client';

import Image from 'next/image';
import React from 'react';
import { useUserProfileStore } from '../store/userProfileStore';

const UserProfileCard = () => {
  const { profile, getProfileImage, resetToDefaultImage } = useUserProfileStore();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-500">로그인된 사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
      {/* 프로필 이미지 */}
      <div className="relative w-20 h-20 mb-4">
        <Image
          src={getProfileImage()}
          alt="프로필"
          fill
          className="rounded-full object-cover border-2 border-gray-200"
        />
      </div>

      {/* 사용자 정보 */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">{profile.nickname}</h2>
        <p className="text-sm text-gray-600">{profile.name}</p>
        <p className="text-sm text-gray-500">{profile.email}</p>
        {profile.bio && (
          <p className="text-sm text-gray-700 italic">&quot;{profile.bio}&quot;</p>
        )}
      </div>

      {/* 기본 이미지로 변경 버튼 (테스트용) */}
      <button
        onClick={resetToDefaultImage}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        기본 이미지로 변경
      </button>
    </div>
  );
};

export default UserProfileCard;