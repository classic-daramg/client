'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { useRegistrationStore } from '../../../../store/registrationStore';
import { useUserProfileStore } from '../../../../store/userProfileStore';
import SignupSuccessPopup from '../../../../components/SignupSuccessPopup';

const ProfileSetupPage = () => {
  const router = useRouter();
  const { updateProfile, getCompleteData, clearRegistrationData } = useRegistrationStore();
  const { loadFromRegistration, defaultProfileImage, getProfileImage, resetToDefaultImage: resetStoreToDefault } = useUserProfileStore();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(defaultProfileImage); // store에서 기본 이미지 가져오기
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);
  const [nicknameCheckError, setNicknameCheckError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (예: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefaultImage = () => {
    setProfileImage(defaultProfileImage);
    // input 파일 선택 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDefaultImage = profileImage === defaultProfileImage;

  const isNicknameValid = nickname.length > 0 && nickname.length <= 8;
  const isBioValid = bio.length > 0 && bio.length <= 12;
  const isFormValid = isNicknameValid && isNicknameChecked && isBioValid && profileImage;

  const handleNext = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // 프로필 정보를 store에 저장
      updateProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        profileImage: profileImage
      });

      // 완전한 회원가입 데이터 가져오기
      const completeData = getCompleteData();

      if (!completeData) {
        alert('회원가입 정보가 부족합니다. 처음부터 다시 시작해주세요.');
        router.push('/loginpage/register');
        return;
      }

      console.log('완전한 회원가입 데이터:', completeData);

      // TODO: 백엔드 API 연결 후 주석 해제
      /*
      // 백엔드 API로 회원가입 요청
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: completeData.name,
          email: completeData.email,
          password: completeData.password,
          birthDate: completeData.birthDate,
          nickname: completeData.profile.nickname,
          bio: completeData.profile.bio,
          profileImage: completeData.profile.profileImage,
          agreements: completeData.agreements
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 회원가입 성공
        console.log('회원가입 성공:', data);

        // Zustand store 데이터 클리어
        clearRegistrationData();

        // 성공 팝업 표시
        setShowSuccessPopup(true);

      } else {
        // 회원가입 실패
        switch (response.status) {
          case 409:
            alert('이미 존재하는 이메일입니다.');
            break;
          case 400:
            alert(data.message || '입력 정보를 확인해주세요.');
            break;
          default:
            alert(data.message || '회원가입에 실패했습니다.');
        }
      }
      */

      // 테스트용: 백엔드 연결 전까지 임시로 성공 처리
      console.log('회원가입 성공 (테스트):', completeData);

      // 회원가입 완료 시 사용자 프로필 store에 데이터 로드
      loadFromRegistration(completeData);

      // Zustand store 데이터 클리어
      clearRegistrationData();

      // 성공 팝업 표시
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupConfirm = () => {
    setShowSuccessPopup(false);
    // 로그인 페이지로 이동
    router.push('/loginpage');
  };

  // 닉네임 중복 체크 API 호출
  const handleNicknameCheck = async () => {
    if (!isNicknameValid) return;
    setNicknameCheckLoading(true);
    setNicknameCheckError('');
    setIsNicknameChecked(false);
    try {
      // 실제 API 엔드포인트로 변경 필요
      const response = await fetch(`/api/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const data = await response.json();
      if (response.ok && data.available) {
        setIsNicknameChecked(true);
        setNicknameCheckError('');
      } else {
        setIsNicknameChecked(false);
        setNicknameCheckError('이미 사용 중인 닉네임입니다.');
      }
    } catch (error) {
      setIsNicknameChecked(false);
      setNicknameCheckError('닉네임 중복 확인 중 오류가 발생했습니다.');
    } finally {
      setNicknameCheckLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[375px] mx-auto h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex flex-col">
        {/* Status Bar */}
        <div className="h-[54px] bg-white pt-[21px]" />

        {/* Navigation Bar */}
        <div className="bg-white px-5 pb-3">
          <div className="flex items-center gap-1 h-[30px]">
            <Link href="/loginpage/register/terms">
              <button className="w-5 h-5 flex items-center justify-center">
                <svg width="7" height="15" viewBox="0 0 7 15" fill="none" className="rotate-180">
                  <path d="M1 1L6 7.5L1 14" stroke="#1A1A1A" strokeWidth="2"/>
                </svg>
              </button>
            </Link>
            <h1 className="ml-1 text-base font-semibold text-[#1A1A1A]">
              회원가입
            </h1>
          </div>
        </div>
      </div>

      {/* Background Separator */}
      <div className="h-[10px] bg-[#F4F5F7]" />

      {/* Main Content */}
      <div className="flex-1 px-5 pt-10">
        <div className="flex flex-col items-center gap-[30px]">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="relative w-[163px] h-[163px]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="profile-upload"
                className="block w-full h-full rounded-full overflow-hidden cursor-pointer bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={profileImage || defaultProfileImage}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              </label>
            </div>

            <div className="flex items-center gap-1 text-[#A6A6A6]">
              <img
                src="/icons/write.svg"
                alt="카메라 아이콘"
                className="w-5 h-5"
              />

              {isDefaultImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#A6A6A6] border-b border-[#A6A6A6] cursor-pointer"
                >
                  프로필 사진 등록
                </button>
              ) : (
                <button
                  onClick={resetToDefaultImage}
                  className="text-xs font-semibold text-[#A6A6A6] border-b border-[#A6A6A6] cursor-pointer"
                >
                  기본이미지로 변경
                </button>
              )}
            </div>
          </div>

          {/* Nickname Input */}
          <div className="w-full flex flex-col gap-2.5">
            <label className="text-sm font-semibold text-[#4C4C4C]">
              닉네임 입력
            </label>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-end gap-2.5">
                <div className="flex-1 flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="최대 8글자 입력 가능합니다"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value.slice(0, 8));
                      setIsNicknameChecked(false);
                      setNicknameCheckError('');
                    }}
                    className="w-full text-[15px] font-medium text-[#1A1A1A] placeholder:text-[#BFBFBF] border-b border-[#D9D9D9] pb-3 outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNicknameCheck}
                  className={`px-3.5 py-2.5 rounded-md text-xs font-medium text-white whitespace-nowrap transition-colors duration-200 ${
                    isNicknameValid && !nicknameCheckLoading ? 'bg-[#293A92] cursor-pointer hover:bg-[#1e2c73]' : 'bg-[#D9D9D9] cursor-not-allowed'
                  }`}
                  disabled={!isNicknameValid || nicknameCheckLoading}
                >
                  {nicknameCheckLoading ? '확인 중...' : '중복 인증'}
                </button>
              </div>
              {isNicknameChecked && (
                <div className="text-xs text-[#293A92] mt-1">사용 가능한 닉네임입니다.</div>
              )}
              {nicknameCheckError && (
                <div className="text-xs text-red-500 mt-1">{nicknameCheckError}</div>
              )}
            </div>
          </div>

          {/* BIO Input */}
          <div className="w-full flex flex-col gap-2.5">
            <label className="text-sm font-semibold text-[#4C4C4C]">
              BIO 입력
            </label>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="최대 12글자 입력 가능합니다"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 12))}
                className="w-full text-[15px] font-medium text-[#1A1A1A] placeholder:text-[#BFBFBF] border-b border-[#D9D9D9] pb-3 outline-none focus:border-[#1A1A1A] transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="px-5 pb-8">
        <button
          onClick={handleNext}
          className={`w-full h-12 rounded-md font-semibold text-base text-white transition-colors ${
            isFormValid && !isLoading
              ? 'bg-[#1A1A1A] hover:bg-[#333333]'
              : 'bg-[#A6A6A6] cursor-not-allowed'
          }`}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>처리 중...</span>
            </div>
          ) : (
            '완료'
          )}
        </button>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <SignupSuccessPopup onConfirm={handlePopupConfirm} />
      )}
    </div>
  );
}

export default ProfileSetupPage;
// 완료버튼만 누르면 회원가입 완료에 api로 회원가입을 post 하기