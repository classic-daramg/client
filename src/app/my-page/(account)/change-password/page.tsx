"use client";
import React, { useState } from 'react';
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

export default function ChangePassword() {

	// 상태 관리
	const [step, setStep] = useState<'current'|'new'|'confirm'|'done'>('current');
	const [currentPw, setCurrentPw] = useState('');
	const [newPw, setNewPw] = useState('');
	const [confirmPw, setConfirmPw] = useState('');
	const [message, setMessage] = useState('');
	const [popup, setPopup] = useState<string|null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// 비밀번호 유효성 검증
	const validatePassword = (pw: string): boolean => {
		// 비밀번호 규칙: 10자 이상, 영문 대문자+소문자+숫자+특수문자 모두 포함
		return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,}$/.test(pw);
	};

	// 이벤트 핸들러
	const handleCheckCurrentPw = async () => {
		setIsLoading(true);
		try {
			const response = await apiClient.post('/users/verify-user-password', {
				password: currentPw,
			});

			if (response.data.isPasswordMatch) {
				setMessage('기존 비밀번호와 일치합니다');
				setStep('new');
			} else {
				setMessage('기존 비밀번호와 일치하지 않습니다');
			}
		} catch (error) {
			console.error('Password check error:', error);
			setMessage('비밀번호 확인 중 오류가 발생했습니다');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCheckNewPw = async () => {
		if (validatePassword(newPw)) {
			setMessage('사용 가능한 비밀번호입니다');
			setStep('confirm');
		} else {
			setMessage('사용할 수 없는 비밀번호입니다 (8자 이상, 영문+숫자 필수)');
		}
	};

	const handleCheckConfirmPw = async () => {
		if (newPw !== confirmPw) {
			setMessage('입력한 비밀번호가 일치하지 않습니다');
			return;
		}

		setIsLoading(true);
		try {
			await apiClient.post('/users/change-password', {
				password: newPw,
			});

			setMessage('입력한 비밀번호가 일치합니다');
			setStep('done');
			setPopup('비밀번호가 성공적으로 변경되었습니다.');
			// 상태 초기화
			setCurrentPw('');
			setNewPw('');
			setConfirmPw('');
		} catch (error) {
			console.error('Password change error:', error);
			setMessage('비밀번호 변경 중 오류가 발생했습니다');
		} finally {
			setIsLoading(false);
		}
	};

	// 버튼 활성화 조건
	const isCurrentPwValid = currentPw.length > 0;
	const isNewPwValid = newPw.length > 0;
	const isConfirmPwValid = confirmPw.length > 0;

	return (
		<div className="bg-white min-h-screen flex flex-col items-center">
			<header className="w-full max-w-[375px] flex items-center px-5 pt-[21px] pb-[12px] bg-white sticky top-0 z-10">
				<button className="bg-none border-none p-0 mr-1 cursor-pointer w-[30px] h-[30px] flex items-center justify-center" aria-label="뒤로가기">
					<Image src="/icons/back.svg" alt="뒤로가기" width={30} height={30} />
				</button>
				<h1 className="flex-1 text-center text-[#1a1a1a] text-[16px] font-semibold">비밀번호 변경</h1>
			</header>
			<main className="w-full max-w-[375px] px-5 flex flex-col gap-[30px]">
				<section className="w-full flex flex-col gap-[11px] mt-2">
					<label className="text-[#4c4c4c] text-[14px] font-semibold">비밀번호 재설정</label>
					<div className="text-[#bfbfbf] text-[12px] mb-1">비밀번호 규약 여기에 설명하기</div>
					{/* 기존 비밀번호 입력 */}
					<div className="flex gap-[10px] items-end mb-[6px]">
						<input
							type="password"
							className="flex-1 border-0 border-b border-[#e0e0e0] bg-transparent text-[15px] text-[#1a1a1a] py-2 outline-none"
							placeholder="기존 비밀번호를 입력해주세요"
							value={currentPw}
							onChange={e => setCurrentPw(e.target.value)}
							disabled={step !== 'current' || isLoading}
						/>
						<button
							className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isCurrentPwValid && step === 'current' && !isLoading ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
							onClick={handleCheckCurrentPw}
							disabled={!isCurrentPwValid || step !== 'current' || isLoading}
						>{isLoading ? '확인 중...' : '확인'}</button>
					</div>
					{/* 새 비밀번호 입력 */}
					<div className="flex gap-[10px] items-end mb-[6px]">
						<input
							type="password"
							className="flex-1 border-0 border-b border-[#e0e0e0] bg-transparent text-[15px] text-[#1a1a1a] py-2 outline-none"
							placeholder="새로운 비밀번호를 입력해주세요"
							value={newPw}
							onChange={e => setNewPw(e.target.value)}
							disabled={step !== 'new' || isLoading}
						/>
						<button
							className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isNewPwValid && step === 'new' && !isLoading ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
							onClick={handleCheckNewPw}
							disabled={!isNewPwValid || step !== 'new' || isLoading}
						>확인</button>
					</div>
					{/* 새 비밀번호 재입력 */}
					<div className="flex gap-[10px] items-end mb-[6px]">
						<input
							type="password"
							className="flex-1 border-0 border-b border-[#e0e0e0] bg-transparent text-[15px] text-[#1a1a1a] py-2 outline-none"
							placeholder="비밀번호를 한번 더 입력해주세요"
							value={confirmPw}
							onChange={e => setConfirmPw(e.target.value)}
							disabled={step !== 'confirm' || isLoading}
						/>
						<button
							className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isConfirmPwValid && step === 'confirm' && !isLoading ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
							onClick={handleCheckConfirmPw}
							disabled={!isConfirmPwValid || step !== 'confirm' || isLoading}
						>{isLoading ? '확인 중...' : '확인'}</button>
					</div>
					{/* 메시지 */}
					{message && <div className="text-xs text-blue-900 mt-2 min-h-[18px]">{message}</div>}
				</section>
				<button className="w-full bg-[#a6a6a6] text-white border-none rounded-[6px] py-[14px] text-[16px] font-semibold mt-10 mb-5 cursor-pointer" disabled>완료</button>
			</main>
			{popup && <Popup message={popup} onClose={() => setPopup(null)} />}
		</div>
	);
}
