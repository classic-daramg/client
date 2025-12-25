'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserProfileStore } from '@/store/userProfileStore';
import ToastNotification from '@/components/ToastNotification';

export default function DeleteAccountPage() {
    const router = useRouter();
    const clearProfile = useUserProfileStore((state) => state.clearProfile);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // 비밀번호 확인 및 팝업 표시
    const handlePasswordConfirm = async () => {
        if (!password.trim()) {
            setToast({ show: true, message: '비밀번호를 입력해주세요.' });
            return;
        }

        setIsLoading(true);

        // 임시 테스트: 항상 비밀번호를 올바르다고 판단
        setTimeout(() => {
            setShowPopup(true);
            setIsLoading(false);
        }, 500);

        /* 실제 API 호출 코드 (테스트 후 주석 해제)
        try {
            const response = await fetch('/api/auth/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                setShowPopup(true);
            } else {
                setToast({ show: true, message: '비밀번호가 일치하지 않습니다.' });
            }
        } catch (error) {
            console.error('비밀번호 확인 오류:', error);
            setToast({ show: true, message: '네트워크 오류가 발생했습니다.' });
        } finally {
            setIsLoading(false);
        }
        */
    };

    // 회원 탈퇴 처리
    const handleDeleteAccount = async () => {
        setIsLoading(true);

        // 임시 테스트: 로그아웃 후 로그인 페이지로 이동
        setTimeout(() => {
            localStorage.removeItem('authToken');
            clearProfile();
            setToast({ show: true, message: '회원 탈퇴가 완료되었습니다.' });
            setTimeout(() => {
                router.push('/loginpage');
            }, 1000);
        }, 500);

        /* 실제 API 호출 코드 (테스트 후 주석 해제)
        try {
            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('authToken');
                clearProfile();
                setToast({ show: true, message: '회원 탈퇴가 완료되었습니다.' });

                setTimeout(() => {
                    router.push('/loginpage');
                }, 1500);
            } else {
                setToast({ show: true, message: '탈퇴 처리에 실패했습니다.' });
            }
        } catch (error) {
            console.error('회원 탈퇴 오류:', error);
            setToast({ show: true, message: '네트워크 오류가 발생했습니다.' });
        } finally {
            setIsLoading(false);
        }
        */
    };

    return (
        <div className="relative w-[375px] h-[812px] bg-white mx-auto">
            {/* Status Bar */}
            <div className="flex flex-col items-start pt-[21px] w-full h-[54px] bg-white" />

            {/* Header */}
            <div className="flex flex-col items-start px-5 pb-3 gap-4 w-full h-[36px] bg-white">
                <div className="flex flex-row items-center gap-1 w-full h-[24px]">
                    <Link href="/my-page">
                        <button className="w-6 h-6 flex items-center justify-center">
                            <svg width="7" height="15" viewBox="0 0 7 15" fill="none" className="rotate-180">
                                <path d="M1 1L6 7.5L1 14" stroke="#1A1A1A" strokeWidth="2" />
                            </svg>
                        </button>
                    </Link>
                    <div className="flex-1 font-pretendard font-semibold text-base text-[#1A1A1A]">
                        회원탈퇴
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col w-full">
                {/* 안내 메시지 */}
                <div className="bg-[#F4F5F7] px-5 py-[14px] w-full">
                    <p className="font-pretendard font-medium text-xs text-[#4C4C4C]">
                        회원 탈퇴 시 탈퇴일로부터 31일 이후부터 재가입이 가능합니다.
                    </p>
                </div>

                {/* 비밀번호 입력 섹션 */}
                <div className="bg-white px-5 py-[18px] w-full">
                    <div className="flex flex-col gap-[11px] w-full">
                        <div className="font-pretendard font-semibold text-sm text-[#4C4C4C]">
                            비밀번호 입력
                        </div>
                        <div className="relative w-full">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력해주세요"
                                className="w-full h-[42px] bg-[#F4F5F7] rounded-md px-[14px] font-pretendard font-medium text-sm text-[#4C4C4C] placeholder:text-[#A6A6A6] outline-none"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-[14px] top-1/2 transform -translate-y-1/2 w-[14px] h-[14px] flex items-center justify-center"
                            >
                                {showPassword ? (
                                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                                        <path
                                            d="M7 0C4.06 0 1.56 1.66 0.5 4C1.56 6.34 4.06 8 7 8C9.94 8 12.44 6.34 13.5 4C12.44 1.66 9.94 0 7 0ZM7 6.67C5.53 6.67 4.33 5.47 4.33 4C4.33 2.53 5.53 1.33 7 1.33C8.47 1.33 9.67 2.53 9.67 4C9.67 5.47 8.47 6.67 7 6.67ZM7 2.4C6.12 2.4 5.4 3.12 5.4 4C5.4 4.88 6.12 5.6 7 5.6C7.88 5.6 8.6 4.88 8.6 4C8.6 3.12 7.88 2.4 7 2.4Z"
                                            fill="#BFBFBF"
                                        />
                                    </svg>
                                ) : (
                                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                                        <path
                                            d="M7 0C4.06 0 1.56 1.66 0.5 4C1.56 6.34 4.06 8 7 8C9.94 8 12.44 6.34 13.5 4C12.44 1.66 9.94 0 7 0ZM7 6.67C5.53 6.67 4.33 5.47 4.33 4C4.33 2.53 5.53 1.33 7 1.33C8.47 1.33 9.67 2.53 9.67 4C9.67 5.47 8.47 6.67 7 6.67ZM7 2.4C6.12 2.4 5.4 3.12 5.4 4C5.4 4.88 6.12 5.6 7 5.6C7.88 5.6 8.6 4.88 8.6 4C8.6 3.12 7.88 2.4 7 2.4Z"
                                            fill="#BFBFBF"
                                        />
                                        <line x1="1" y1="1" x2="13" y2="7" stroke="#BFBFBF" strokeWidth="1.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 탈퇴하기 버튼 */}
            <button
                onClick={handlePasswordConfirm}
                disabled={isLoading || !password.trim()}
                className={`absolute bottom-[27px] left-1/2 transform -translate-x-1/2 w-[335px] h-[48px] rounded-md flex items-center justify-center transition-colors ${isLoading || !password.trim()
                        ? 'bg-[#A6A6A6] cursor-not-allowed'
                        : 'bg-[#293A92] cursor-pointer hover:bg-[#1e2c73]'
                    }`}
            >
                <span className="font-pretendard font-semibold text-base text-white">
                    {isLoading ? '처리 중...' : '탈퇴하기'}
                </span>
            </button>

            {/* 확인 팝업 */}
            {showPopup && (
                <div className="absolute inset-0 bg-transparent flex items-center justify-center z-50">
                    <div className="bg-white w-[272px] rounded-[20px] shadow-lg p-[28px_28px_16px_28px] flex flex-col gap-[10px]">
                        <div className="py-[6px] text-center">
                            <p className="font-pretendard font-semibold text-base text-[#4C4C4C] leading-normal">
                                클래식 듣는 다람쥐를
                                <br />
                                정말 탈퇴하시겠습니까?
                            </p>
                        </div>
                        <div className="flex gap-[6px] w-full">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="flex-1 border border-[#D9D9D9] rounded-full px-[14px] py-[6px] bg-white"
                            >
                                <span className="font-pretendard font-semibold text-xs text-[#4C4C4C]">
                                    취소
                                </span>
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isLoading}
                                className={`flex-1 rounded-full px-[14px] py-[6px] ${isLoading
                                        ? 'bg-[#A6A6A6] cursor-not-allowed'
                                        : 'bg-[#293A92] hover:bg-[#1e2c73]'
                                    }`}
                            >
                                <span className="font-pretendard font-semibold text-xs text-white">
                                    {isLoading ? '처리 중...' : '탈퇴하기'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <ToastNotification
                message={toast.message}
                isVisible={toast.show}
                onClose={() => setToast({ show: false, message: '' })}
                duration={3000}
            />
        </div>
    );
}