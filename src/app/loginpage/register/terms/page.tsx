'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useRegistrationStore } from '../../../../store/registrationStore';

const TermsAgreementPage = () => {
  const router = useRouter();
  const { updateAgreements, setStep } = useRegistrationStore();
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false
  });

  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked
    });
  };

  const handleIndividualAgreement = (key: keyof typeof agreements, checked: boolean) => {
    const newAgreements = { ...agreements, [key]: checked };
    
    // Check if all individual items are checked
    const allChecked = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
    newAgreements.all = allChecked;
    
    setAgreements(newAgreements);
  };

  const isNextEnabled = agreements.terms && agreements.privacy; // 필수 항목만 체크

  const handleNext = () => {
    if (isNextEnabled) {
      // Zustand store에 약관 동의 정보 저장
      updateAgreements({
        terms: agreements.terms,
        privacy: agreements.privacy,
        marketing: agreements.marketing
      });

      setStep('profile');
      router.push('/loginpage/register/profile');
    }
  };

  const handleBack = () => {
    router.push('/loginpage/register');
  };

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
                <button onClick={handleBack} className="w-5 h-5 flex items-center justify-center">
                  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" className="rotate-180">
                    <path d="M1 1L6 7.5L1 14" stroke="#1A1A1A" strokeWidth="2"/>
                  </svg>
                </button>

                {/* Title */}
                <h1 className="ml-1 h-[19px] font-pretendard font-semibold text-base leading-[19px] flex items-center text-[#1A1A1A]">
                  회원가입
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Divider */}
      <div className="absolute left-0 top-[98px] w-[375px] h-[10px] bg-[#F4F5F7]"></div>

      {/* Content */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-[123px] w-[335px] h-[599px] flex flex-col items-start gap-[15px]">
        
        {/* 서비스 이용 약관 */}
        <div className="flex flex-col items-start gap-[10px] w-[335px] h-[195px]">
          <h2 className="w-[335px] h-[17px] font-pretendard font-semibold text-sm leading-[17px] flex items-center text-[#4C4C4C]">
            서비스 이용 약관
          </h2>
          <div className="flex flex-row justify-center items-center p-[14px] gap-[10px] w-[335px] h-[168px] bg-[#F4F5F7] rounded-md">
            <div className="flex-1 h-[140px] font-pretendard font-medium text-xs leading-[14px] flex items-center text-[#A6A6A6] overflow-y-auto">
              이용약관 전문
              {'\n\n'}
              제1조 (목적)
              이 약관은 클래식듣는다람쥐(이하 &quot;회사&quot;)가 제공하는 서비스의 이용조건 및 절차, 회사와 회원의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
              {'\n\n'}
              제2조 (정의)
              1. &quot;서비스&quot;라 함은 회사가 제공하는 모든 서비스를 의미합니다.
              2. &quot;회원&quot;이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
            </div>
          </div>
        </div>

        {/* 개인정보처리방침 */}
        <div className="flex flex-col items-start gap-[10px] w-[335px] h-[195px]">
          <h2 className="w-[335px] h-[17px] font-pretendard font-semibold text-sm leading-[17px] flex items-center text-[#4C4C4C]">
            개인정보처리방침
          </h2>
          <div className="flex flex-row justify-center items-center p-[14px] gap-[10px] w-[335px] h-[168px] bg-[#F4F5F7] rounded-md">
            <div className="flex-1 h-[140px] font-pretendard font-medium text-xs leading-[14px] flex items-center text-[#A6A6A6] overflow-y-auto">
              개인정보처리방침 전문
              {'\n\n'}
              1. 개인정보의 처리목적
              회사는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.
              - 회원가입 및 관리
              - 서비스 제공
              - 민원사무 처리
              {'\n\n'}
              2. 개인정보의 처리 및 보유기간
              회사는 정보주체로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </div>
          </div>
        </div>

        {/* 약관 동의 섹션 */}
        <div className="flex flex-col items-start gap-[10px] w-[335px] h-[179px]">
          {/* 약관 전체동의 */}
          <div className="flex flex-row items-center gap-[18px] w-[335px] h-[17px]">
            <div className="flex flex-col items-start gap-[2px] w-[283px] h-[17px]">
              <span className="w-[90px] h-[17px] font-pretendard font-semibold text-sm leading-[17px] flex items-center text-[#4C4C4C]">
                약관 전체동의
              </span>
            </div>
            <button
              onClick={() => handleAllAgreement(!agreements.all)}
              className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center ${
                agreements.all ? 'border-[#293A92] bg-[#293A92]' : 'border-[#D9D9D9]'
              }`}
            >
              {agreements.all && (
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
            </button>
          </div>

          {/* 개별 동의 항목들 */}
          <div className="flex flex-row justify-center items-center px-[14px] py-[25px] gap-[10px] w-[335px] h-[152px] border-2 border-[#F5F5F5] rounded-md">
            <div className="flex flex-col items-start gap-[18px] w-[311px] h-[102px]">
              
              {/* 이용약관 동의 */}
              <div className="flex flex-row items-center px-[10px] gap-[18px] w-[311px] h-[17px]">
                <div className="flex flex-col items-start gap-[2px] flex-1 h-[17px]">
                  <span className="w-[261px] h-4 font-pretendard font-medium text-[13px] leading-4 flex items-center text-[#A6A6A6]">
                    (필수) 이용약관을 꼼꼼히 읽었으며 동의하십니까?
                  </span>
                </div>
                <button
                  onClick={() => handleIndividualAgreement('terms', !agreements.terms)}
                  className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center ${
                    agreements.terms ? 'border-[#293A92] bg-[#293A92]' : 'border-[#D9D9D9]'
                  }`}
                >
                  {agreements.terms && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              </div>

              {/* 개인정보 동의 */}
              <div className="flex flex-row items-center px-[10px] gap-[18px] w-[311px] h-[17px]">
                <div className="flex flex-col items-start gap-[2px] flex-1 h-[17px]">
                  <span className="w-[261px] h-4 font-pretendard font-medium text-[13px] leading-4 flex items-center tracking-[-0.02em] text-[#A6A6A6]">
                    (필수) 개인정보 수집 및 이용에 동의하십니까?
                  </span>
                </div>
                <button
                  onClick={() => handleIndividualAgreement('privacy', !agreements.privacy)}
                  className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center ${
                    agreements.privacy ? 'border-[#293A92] bg-[#293A92]' : 'border-[#D9D9D9]'
                  }`}
                >
                  {agreements.privacy && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              </div>

              {/* 마케팅 동의 */}
              <div className="flex flex-row items-center px-[10px] gap-[18px] w-[311px] h-8">
                <div className="flex flex-col items-start gap-[2px] flex-1 h-8">
                  <span className="w-[261px] h-8 font-pretendard font-medium text-[13px] leading-4 flex items-center text-[#A6A6A6]">
                    (선택) 이벤트·혜택 등 광고성 정보를 이메일 또는 웹 알림으로 받는 것에 동의하십니까?
                  </span>
                </div>
                <button
                  onClick={() => handleIndividualAgreement('marketing', !agreements.marketing)}
                  className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center ${
                    agreements.marketing ? 'border-[#293A92] bg-[#293A92]' : 'border-[#D9D9D9]'
                  }`}
                >
                  {agreements.marketing && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!isNextEnabled}
        className={`absolute left-1/2 transform -translate-x-1/2 top-[737px] flex flex-row justify-center items-center px-5 py-[5px] gap-[2px] w-[335px] h-12 rounded-md ${
          isNextEnabled ? 'bg-[#293A92]' : 'bg-[#A6A6A6]'
        }`}
      >
        <span className="flex-1 h-[19px] font-pretendard font-semibold text-base leading-[19px] flex items-center justify-center text-white cursor-pointer">
          다음
        </span>
        <div className="w-5 h-5">
          <svg width="7" height="15" viewBox="0 0 7 15" fill="none">
            <path d="M1 1L6 7.5L1 14" stroke="#FFFFFF" strokeWidth="2"/>
          </svg>
        </div>
      </button>

      {/* Home Indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible"></div>
    </div>
  );
};

export default TermsAgreementPage;