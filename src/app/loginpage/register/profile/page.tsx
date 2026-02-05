'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { useRegistrationStore } from '../../../../store/registrationStore';
import { useUserProfileStore } from '../../../../store/userProfileStore';
import SignupSuccessPopup from '../../../../components/SignupSuccessPopup';

const ProfileSetupPage = () => {
  const router = useRouter();
  const { updateProfile, getCompleteData, clearRegistrationData } = useRegistrationStore();
  const { loadFromRegistration, defaultProfileImage } = useUserProfileStore();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageBlob, setProfileImageBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckLoading, setNicknameCheckLoading] = useState(false);
  const [nicknameCheckError, setNicknameCheckError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (200KB 이하로 제한)
    if (file.size > 200 * 1024) {
      setUploadError('파일 크기는 200KB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    // FileReader를 Promise로 변환하여 async/await 처리
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new window.Image();
      
      img.onload = () => {
        try {
          // 이미지 리사이징
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context를 가져올 수 없습니다.');
          
          ctx.drawImage(img, 0, 0, width, height);

          // Canvas를 Blob으로 변환 (JPEG 품질 0.7)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setUploadError('이미지 변환에 실패했습니다.');
                setUploadLoading(false);
                return;
              }

              // Blob이 너무 크지 않은지 확인
              if (blob.size > 200 * 1024) {
                setUploadError('압축된 이미지가 너무 큽니다. 더 작은 이미지를 선택해주세요.');
                setUploadLoading(false);
                return;
              }

              // DataURL로 미리보기 생성
              const reader2 = new FileReader();
              reader2.onload = (e2) => {
                const dataUrl = e2.target?.result as string;
                setProfileImage(dataUrl);
                setProfileImageBlob(blob);
                setUploadLoading(false);

                console.log('=== 이미지 업로드 완료 ===');
                console.log('Blob size:', blob.size, 'bytes');
                console.log('Blob type:', blob.type);
                console.log('========================');
              };
              reader2.onerror = () => {
                setUploadError('이미지 미리보기 생성 실패');
                setUploadLoading(false);
              };
              reader2.readAsDataURL(blob);
            },
            'image/jpeg',
            0.7
          );
        } catch {
          setUploadError('이미지 처리 중 오류가 발생했습니다.');
          setUploadLoading(false);
        }
      };

      img.onerror = () => {
        setUploadError('이미지 로드 실패. 다른 이미지를 선택해주세요.');
        setUploadLoading(false);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      setUploadError('파일 읽기 실패. 다시 시도해주세요.');
      setUploadLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const resetToDefaultImage = () => {
    setProfileImage(defaultProfileImage);
    // input 파일 선택 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDefaultImage = profileImage === defaultProfileImage;

  const isNicknameValid = nickname.length >= 2 && nickname.length <= 8;
  const isBioValid = bio.length > 0 && bio.length <= 12;
  const isFormValid = isNicknameValid && isNicknameChecked && isBioValid && profileImage;

  const handleNext = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // 프로필 정보를 store에 저장 (이미지는 서버에서 저장되므로 프리뷰를 임시로 유지)
      updateProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        profileImage: profileImage || defaultProfileImage,
      });

      // 완전한 회원가입 데이터 가져오기
      const completeData = getCompleteData();

      if (!completeData) {
        alert('회원가입 정보가 부족합니다. 처음부터 다시 시작해주세요.');
        router.push('/loginpage/register');
        return;
      }



      // birthDate 형식 변환: "2002년 4월 18일" -> "2002-04-18"
      const birthDateMatch = completeData.birthDate.match(/(\d+)년 (\d+)월 (\d+)일/);
      let formattedBirthDate = '';
      if (birthDateMatch) {
        const year = birthDateMatch[1];
        const month = birthDateMatch[2].padStart(2, '0');
        const day = birthDateMatch[3].padStart(2, '0');
        formattedBirthDate = `${year}-${month}-${day}`;
      }

      // SignupRequestDto 구성 (백엔드 요구사항 정확히 준수)
      const signupRequest = {
        name: completeData.name.trim(),
        email: completeData.email.trim(),
        password: completeData.password,
        birthdate: formattedBirthDate,
        nickname: completeData.profile.nickname.trim(),
        bio: completeData.profile.bio.trim() || null, // 빈 문자열은 null로
      };

      // 디버깅: 요청 데이터 확인
      console.log('=== 회원가입 요청 데이터 ===');
      console.log('signupRequest:', signupRequest);
      console.log('profileImageBlob:', profileImageBlob);
      console.log('========================');

      // form-data 본문 구성 (signupRequest JSON Blob + image 파일)
      const formData = new FormData();
      
      // signupRequest를 JSON Blob으로 감싸서 추가 (type: 'application/json' 명시 필수)
      const jsonBlob = new Blob([JSON.stringify(signupRequest)], { type: 'application/json' });
      formData.append('signupRequest', jsonBlob);
      
      // 이미지가 있을 경우에만 추가 (선택사항)
      if (profileImageBlob) {
        formData.append('image', profileImageBlob, 'profile.jpg');
      }

      // 백엔드 API로 회원가입 요청 (multipart/form-data)
      // Content-Type 헤더를 명시하지 않음 (브라우저가 자동으로 boundary 설정)
      const response = await fetch(getApiUrl('/auth/signup'), {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // 회원가입 성공 (201 Created)

        // 회원가입 완료 시 사용자 프로필 store에 데이터 로드
        loadFromRegistration(completeData);

        // Zustand store 데이터 클리어
        clearRegistrationData();

        // 성공 팝업 표시
        setShowSuccessPopup(true);
      } else {
        // 회원가입 실패 - 응답 본문이 있을 경우만 파싱
        let errorMessage = '회원가입에 실패했습니다.';

        // 텍스트 응답 먼저 시도
        try {
          const textError = await response.text();

          // 텍스트가 JSON일 수도 있으니 파싱 시도
          try {
            const jsonError = JSON.parse(textError);
            errorMessage = jsonError.message || jsonError.error || textError;
          } catch {
            // JSON이 아니면 텍스트 그대로 사용
            errorMessage = textError || errorMessage;
          }
        } catch {
          // 응답 본문 읽기 실패
        }

        switch (response.status) {
          case 409:
            alert('이미 존재하는 이메일 또는 닉네임입니다.');
            break;
          case 400:
            alert(`입력 정보 오류:\n\n${errorMessage}\n\n스키마 조건:\n- 비밀번호: 영문 대소문자, 숫자, 특수문자 포함 10자 이상\n- 생년월일: YYYY-MM-DD 형식\n- 닉네임: 2~8자\n- BIO: 12자 이하`);
            break;
          default:
            alert(`회원가입 오류 (${response.status}): ${errorMessage}`);
        }
      }
    } catch {
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
      const response = await fetch(getApiUrl(`/users/check-nickname?nickname=${encodeURIComponent(nickname)}`));
      
      if (response.ok) {
        // 응답 본문이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        let isAvailable = false;

        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            // API 응답 형식: { "닉네임 사용 가능 유무: ": true }
            isAvailable = data['닉네임 사용 가능 유무: '] !== undefined 
              ? data['닉네임 사용 가능 유무: ']
              : data.available !== undefined 
              ? data.available
              : false;
          } catch {
            // 빈 응답이나 파싱 실패 시 사용 가능한 것으로 처리
            isAvailable = true;
          }
        } else {
          // JSON이 아닌 경우 사용 가능한 것으로 처리
          isAvailable = true;
        }

        if (isAvailable) {
          setIsNicknameChecked(true);
          setNicknameCheckError('');
        } else {
          setIsNicknameChecked(false);
          setNicknameCheckError('이미 사용 중인 닉네임입니다.');
        }
      } else {
        setIsNicknameChecked(false);
        setNicknameCheckError('이미 사용 중인 닉네임입니다.');
      }
    } catch {
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
                <Image
                  src={profileImage || defaultProfileImage}
                  alt="프로필"
                  width={163}
                  height={163}
                  className="w-full h-full object-cover"
                />
                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </label>
            </div>

            <div className="flex items-center gap-1 text-[#A6A6A6]">
              <Image
                src="/icons/write.svg"
                alt="카메라 아이콘"
                width={20}
                height={20}
                className="w-5 h-5"
              />

              {isDefaultImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#A6A6A6] border-b border-[#A6A6A6] cursor-pointer"
                >
                  {uploadLoading ? '업로드 중...' : '프로필 사진 등록'}
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
            {uploadError && (
              <div className="text-xs text-red-500 mt-1">{uploadError}</div>
            )}
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
                    placeholder="2~8글자 입력 가능합니다"
                    value={nickname}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 8);
                      setNickname(value);
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