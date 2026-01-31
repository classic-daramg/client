'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import PasswordChangePopup from '../../../components/PasswordChangePopup';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 비밀번호 확인 검증
    if (field === 'confirmPassword') {
      if (value !== formData.newPassword) {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      } else {
        setPasswordError('');
      }
    }

    if (field === 'newPassword') {
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSendCode = async () => {
    if (!formData.email.trim()) return;

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 연결 후 주석 해제
      /*
      const response = await fetch('/api/auth/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (response.ok) {
        setIsCodeSent(true);
        setStep('verify');
      } else {
        alert('이메일을 찾을 수 없습니다.');
      }
      */

      // 테스트용
      setStep('verify');
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) return;

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 연결 후 주석 해제
      /*
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode
        })
      });

      if (response.ok) {
        setIsEmailVerified(true);
        setStep('reset');
      } else {
        alert('인증코드가 올바르지 않습니다.');
      }
      */

      // 테스트용
      setStep('reset');
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword.trim() || !formData.confirmPassword.trim() || passwordError) {
      return;
    }

    setIsLoading(true);

    // TODO: 백엔드 API 연결 후 주석 해제하고 테스트 코드 제거
    /*
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          verificationCode: formData.verificationCode,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        setShowSuccessPopup(true);
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
    */

    // 테스트용 코드 (try-catch 없이)
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessPopup(true);
    }, 1000);
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    router.push('/loginpage');
  };

  const isEmailStepValid = formData.email.trim() !== '';
  const isVerifyStepValid = formData.verificationCode.trim() !== '';
  const isResetStepValid = formData.newPassword.trim() !== '' &&
                           formData.confirmPassword.trim() !== '' &&
                           passwordError === '';

  return (
    <div className="relative w-[375px] h-[812px] bg-white mx-auto">
      {/* Header */}
      <div className="absolute left-0 top-0 w-[375px] h-24 flex flex-col items-start">
        <div className="flex flex-col items-center gap-[10px] w-[375px] h-24">
          <div className="flex flex-col items-start w-[375px] h-24">
            {/* Status Bar */}
            <div className="flex flex-col items-start pt-[21px] w-[375px] h-[54px] bg-white">
              {/* Status bar content */}
            </div>

            {/* Header Content */}
            <div className="flex flex-col items-start px-5 pb-3 gap-4 w-[375px] h-[42px] bg-white">
              <div className="flex flex-row items-center gap-1 w-[335px] h-[30px]">
                {/* Back Button */}
                <Link href="/loginpage">
                  <button className="w-5 h-5 flex items-center justify-center">
                    <svg width="7" height="15" viewBox="0 0 7 15" fill="none" className="rotate-180">
                      <path d="M1 1L6 7.5L1 14" stroke="#1A1A1A" strokeWidth="2"/>
                    </svg>
                  </button>
                </Link>
                {/* Title */}
                <h1 className="ml-1 h-[19px] font-pretendard font-semibold text-base leading-[19px] flex items-center text-[#1A1A1A]">
                  비밀번호 재설정
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Divider */}
      <div className="absolute left-0 top-[98px] w-[375px] h-[10px] bg-[#F4F5F7]"></div>

      {/* Form Content */}
      <div className="absolute left-5 top-[127px] w-[335px] flex flex-col items-start gap-[30px]">

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <>
            <div className="flex flex-col items-start gap-[15px] w-[335px]">
              <div className="flex flex-col items-start gap-1 w-[335px]">
                <label className="w-[335px] h-[17px] font-pretendard font-semibold text-sm leading-[17px] flex items-center text-[#4C4C4C]">
                  이메일 입력
                </label>
                <p className="w-[335px] h-[14px] font-pretendard font-medium text-xs leading-[14px] flex items-center text-[#BFBFBF]">
                  가입하신 이메일 주소를 입력해주세요.
                </p>
              </div>

              <div className="flex flex-row items-end gap-[10px] w-[335px] h-[42px]">
                <div className="flex flex-col items-start gap-3 w-[232px] h-[30px]">
                  <input
                    type="email"
                    placeholder="이메일을 입력해주세요"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-[232px] h-[18px] font-pretendard font-medium text-[15px] leading-[18px] flex items-center text-[#4C4C4C] bg-transparent outline-none"
                  />
                  <div className="w-[231px] h-0 border-t border-[#D9D9D9]"></div>
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={!isEmailStepValid || isLoading}
                  className={`flex flex-row justify-center items-center px-[14px] py-[10px] gap-[10px] w-[94px] h-[42px] rounded-md transition-colors ${
                    isEmailStepValid && !isLoading
                      ? 'bg-[#293A92] text-white hover:bg-[#1e2c73]'
                      : 'bg-[#F4F5F7] text-[#A6A6A6]'
                  }`}
                >
                  <span className="whitespace-nowrap h-[14px] font-pretendard font-medium text-xs leading-[14px] flex items-center">
                    {isLoading ? '전송중...' : '인증코드 전송'}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Verification Code */}
        {step === 'verify' && (
          <>
            <div className="flex flex-col items-start gap-[15px] w-[335px]">
              <div className="flex flex-col items-start gap-1 w-[335px]">
                <label className="w-[335px] h-[17px] font-pretendard font-semibold text-sm leading-[17px] flex items-center text-[#4C4C4C]">
                  인증코드 입력
                </label>
                <p className="w-[335px] h-[14px] font-pretendard font-medium text-xs leading-[14px] flex items-center text-[#BFBFBF]">
                  {formData.email}로 전송된 인증코드를 입력해주세요.
                </p>
              </div>

              <div className="flex flex-row items-end gap-[10px] w-[335px] h-[42px]">
                <div className="flex flex-col items-start gap-3 w-[232px] h-[30px]">
                  <input
                    type="text"
                    placeholder="인증코드를 입력해주세요"
                    value={formData.verificationCode}
                    onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                    className="w-[232px] h-[18px] font-pretendard font-medium text-[15px] leading-[18px] flex items-center text-[#4C4C4C] bg-transparent outline-none"
                  />
                  <div className="w-[231px] h-0 border-t border-[#D9D9D9]"></div>
                </div>
                <button
                  onClick={handleVerifyCode}
                  disabled={!isVerifyStepValid || isLoading}
                  className={`flex flex-row justify-center items-center px-[14px] py-[10px] gap-[10px] w-[94px] h-[42px] rounded-md transition-colors ${
                    isVerifyStepValid && !isLoading
                      ? 'bg-[#293A92] text-white hover:bg-[#1e2c73]'
                      : 'bg-[#F4F5F7] text-[#A6A6A6]'
                  }`}
                >
                  <span className="whitespace-nowrap h-[14px] font-pretendard font-medium text-xs leading-[14px] flex items-center">
                    {isLoading ? '확인중...' : '인증코드 확인'}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'reset' && (
          <>
            <div className="flex flex-col items-start gap-[15px] w-[335px]">
              <div className="flex flex-col items-start gap-1 w-[335px]">
                <label className="w-[335px] h-[17px] font-pretendard font-semibold text-sm leading-[17px] flex items-center text-[#4C4C4C]">
                  새 비밀번호 입력
                </label>
                <p className="w-[335px] h-[14px] font-pretendard font-medium text-xs leading-[14px] flex items-center text-[#BFBFBF]">
                  새로 사용할 비밀번호를 입력해주세요.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 w-[335px]">
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="새 비밀번호를 입력해주세요"
                  className="w-[335px] h-[18px] font-pretendard font-medium text-[15px] leading-[18px] flex items-center text-[#4C4C4C] bg-transparent outline-none"
                />
                <div className="w-[335px] h-0 border-t border-[#D9D9D9]"></div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-[15px] w-[335px]">
              <div className="flex flex-col items-start gap-1 w-[335px]">
                <label className="w-[335px] h-[17px] font-pretendard font-semibold text-sm leading-[17px] flex items-center text-[#4C4C4C]">
                  새 비밀번호 확인
                </label>
              </div>

              <div className="flex flex-col items-start gap-3 w-[335px]">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="비밀번호를 한번 더 입력해주세요"
                  className="w-[335px] h-[18px] font-pretendard font-medium text-[15px] leading-[18px] flex items-center text-[#4C4C4C] bg-transparent outline-none"
                />
                <div className="w-[335px] h-0 border-t border-[#D9D9D9]"></div>
                {passwordError && (
                  <div className="w-[335px] h-[14px] font-pretendard font-medium text-xs leading-[14px] flex items-center text-red-500">
                    {passwordError}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Next Button */}
      {step === 'reset' && (
        <button
          onClick={handleResetPassword}
          disabled={!isResetStepValid || isLoading}
          className={`absolute left-1/2 transform -translate-x-1/2 top-[737px] flex flex-row justify-center items-center px-5 py-[5px] gap-[2px] w-[335px] h-12 rounded-md transition-colors duration-200 ${
            isResetStepValid && !isLoading
              ? 'bg-[#293A92] cursor-pointer hover:bg-[#1e2c73]'
              : 'bg-[#A6A6A6] cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="font-pretendard font-semibold text-base text-white">
                변경 중...
              </span>
            </div>
          ) : (
            <span className="flex-1 h-[19px] font-pretendard font-semibold text-base leading-[19px] flex items-center justify-center text-white">
              비밀번호 변경
            </span>
          )}
        </button>
      )}

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible"></div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <PasswordChangePopup onClose={handlePopupClose} />
      )}
    </div>
  );
};

export default ResetPasswordPage;