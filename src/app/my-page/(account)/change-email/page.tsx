"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/apiClient';

function Popup({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[240px] flex flex-col items-center">
        <span className="mb-4 text-base text-[#1a1a1a]">{message}</span>
        <button className="mt-2 px-4 py-2 bg-[#a6a6a6] text-white rounded font-semibold" onClick={onClose}>확인</button>
      </div>
    </div>
  );
}

export default function ChangeEmail() {
  // 상태 관리
  const [currentEmail, setCurrentEmail] = useState('');
  const [inputCurrentEmail, setInputCurrentEmail] = useState('');
  const [inputNewEmail, setInputNewEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [step, setStep] = useState<'init'|'current-checked'|'code-sent'|'verified'>('init');
  const [popup, setPopup] = useState<{message: string}|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // 버튼 활성화 조건
  const isCurrentEmailValid = inputCurrentEmail.length > 0;
  const isNewEmailValid = inputNewEmail.length > 0;
  const isCodeValid = inputCode.length > 0;

  // 초기 로드: 현재 이메일 불러오기
  useEffect(() => {
    const loadCurrentEmail = async () => {
      setEmailLoading(true);
      try {
        const response = await apiClient.get('/users');
        if (response.data.email) {
          // 이메일 마스킹: ad***@g****.com 형식
          const masked = response.data.email.replace(/(.{2}).*(@.*)/, '$1***$2');
          setCurrentEmail(masked);
        }
      } catch (error) {
        console.error('Failed to load email:', error);
      } finally {
        setEmailLoading(false);
      }
    };

    loadCurrentEmail();
  }, []);

  // Step 1: 기존 이메일 확인
  const handleCheckCurrentEmail = async () => {
    if (!inputCurrentEmail.includes('@')) {
      setPopup({ message: '올바른 이메일 형식을 입력하세요.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get(`/users/verify-user-email?email=${encodeURIComponent(inputCurrentEmail)}`);

      if (response.data.isEmailMatch) {
        setStep('current-checked');
        setPopup({ message: '기존 이메일이 확인되었습니다.' });
      } else {
        setPopup({ message: '기존 이메일이 일치하지 않습니다.' });
      }
    } catch (error) {
      console.error('Email check error:', error);
      setPopup({ message: '이메일 확인에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: 인증코드 전송
  const handleSendCode = async () => {
    if (!inputNewEmail.includes('@')) {
      setPopup({ message: '올바른 이메일 형식을 입력하세요.' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/email-verifications', {
        email: inputNewEmail,
        emailPurpose: 'EMAIL_CHANGE',
      });

      setStep('code-sent');
      setPopup({ message: '인증코드가 이메일로 전송되었습니다.' });
    } catch (error) {
      console.error('Send code error:', error);
      setPopup({ message: '인증코드 전송에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 & 4: 인증코드 확인 및 이메일 변경
  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      // Step 3: 인증코드 확인
      await apiClient.post('/auth/verify-email', {
        email: inputNewEmail,
        verificationCode: inputCode,
      });

      // Step 4: 이메일 변경
      await apiClient.post('/users/change-email', {
        email: inputNewEmail,
      });

      // 성공: UI 업데이트
      const masked = inputNewEmail.replace(/(.{2}).*(@.*)/, '$1***$2');
      setCurrentEmail(masked);
      setStep('verified');
      setInputCurrentEmail('');
      setInputNewEmail('');
      setInputCode('');
      setPopup({ message: '이메일이 성공적으로 변경되었습니다.' });
    } catch (error) {
      console.error('Verify code error:', error);
      setPopup({ message: '인증에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-[#4c4c4c]">사용자 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      <header className="w-full max-w-[375px] flex items-center px-5 pt-[21px] pb-[12px] bg-white sticky top-0 z-10">
        <button className="bg-none border-none p-0 mr-1 cursor-pointer w-[30px] h-[30px] flex items-center justify-center" aria-label="뒤로가기">
          <Image src="/icons/back.svg" alt="뒤로가기" width={30} height={30} />
        </button>
        <h1 className="flex-1 text-center text-[#1a1a1a] text-[16px] font-semibold">이메일 변경</h1>
      </header>
      <main className="w-full max-w-[375px] px-5 flex flex-col gap-[30px]">
        <section className="w-full flex flex-col gap-[11px] mt-2">
          <label className="text-[#4c4c4c] text-[14px] font-semibold">기존 등록된 이메일</label>
          <div className="bg-[#f4f5f7] rounded-[6px] p-[14px] text-[#4c4c4c] text-[15px] font-medium">{currentEmail}</div>
        </section>
        <section className="w-full flex flex-col gap-[11px]">
          <label className="text-[#4c4c4c] text-[14px] font-semibold">이메일 재설정</label>
          <div className="text-[#bfbfbf] text-[12px] mb-1">아이디로 사용할 새 이메일을 설정해주세요</div>
          <div className="flex gap-[10px] items-end mb-[6px]">
            <input
              className="flex-1 border-0 border-b border-[#e0e0e0] bg-transparent text-[15px] text-[#1a1a1a] py-2 outline-none"
              placeholder="기존 이메일을 입력해주세요"
              value={inputCurrentEmail}
              onChange={e => setInputCurrentEmail(e.target.value)}
              disabled={step !== 'init' || isLoading}
            />
            <button
              className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isCurrentEmailValid && step === 'init' && !isLoading ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
              onClick={handleCheckCurrentEmail}
              disabled={!isCurrentEmailValid || step !== 'init' || isLoading}
            >{isLoading ? '확인 중...' : '확인'}</button>
          </div>
          <div className="flex gap-[10px] items-end mb-[6px]">
            <input
              className="flex-1 border-0 border-b border-[#e0e0e0] bg-transparent text-[15px] text-[#1a1a1a] py-2 outline-none"
              placeholder="새로운 이메일을 입력해주세요"
              value={inputNewEmail}
              onChange={e => setInputNewEmail(e.target.value)}
              disabled={(step !== 'current-checked' && step !== 'code-sent') || isLoading}
            />
            <button
              className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isNewEmailValid && (step === 'current-checked' || step === 'code-sent') && !isLoading ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
              onClick={handleSendCode}
              disabled={!isNewEmailValid || (step !== 'current-checked' && step !== 'code-sent') || isLoading}
            >{isLoading ? '전송 중...' : '인증코드 전송'}</button>
          </div>
          <div className="flex gap-[10px] items-end mb-[6px]">
            <input
              className="flex-1 border-0 border-b border-[#e0e0e0] bg-transparent text-[15px] text-[#1a1a1a] py-2 outline-none"
              placeholder="전송된 인증코드를 입력해주세요"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              disabled={(step !== 'code-sent' && step !== 'verified') || isLoading}
            />
            <button
              className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isCodeValid && (step === 'code-sent' || step === 'verified') && !isLoading ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
              onClick={handleVerifyCode}
              disabled={!isCodeValid || (step !== 'code-sent' && step !== 'verified') || isLoading}
            >{isLoading ? '확인 중...' : '인증코드 확인'}</button>
          </div>
        </section>
        <button className="w-full bg-[#a6a6a6] text-white border-none rounded-[6px] py-[14px] text-[16px] font-semibold mt-10 mb-5 cursor-pointer" disabled>완료</button>
      </main>
      {popup && <Popup message={popup.message} onClose={() => setPopup(null)} />}
    </div>
  );
}
