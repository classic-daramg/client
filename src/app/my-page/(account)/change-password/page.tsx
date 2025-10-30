"use client";
import React, { useState } from 'react';
import Image from 'next/image';

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

	// 임시 백엔드 함수
	const fakeServerCheckCurrentPw = async (pw: string) => {
		// 실제로는 서버에서 현재 비밀번호 확인
		return pw === 'QWER1234';
	};
	const fakeServerCheckNewPw = async (pw: string) => {
		// 비밀번호 규칙: 8자 이상, 영문+숫자
		if (!/^.*(?=.{8,})(?=.*\d)(?=.*[a-zA-Z]).*$/.test(pw)) return false;
		// 예시: 사용할 수 없는 비밀번호
		if (pw === 'abcdefg') return false;
		return true;
	};
	const fakeServerChangePw = async (pw: string) => {
		// 실제로는 서버에 비밀번호 변경 요청
		return true;
	};

	// 이벤트 핸들러
	const handleCheckCurrentPw = async () => {
		if (await fakeServerCheckCurrentPw(currentPw)) {
			setMessage('기존 비밀번호와 일치합니다');
			setStep('new');
		} else {
			setMessage('기존 비밀번호와 일치하지 않습니다');
		}
	};
	const handleCheckNewPw = async () => {
		if (await fakeServerCheckNewPw(newPw)) {
			setMessage('사용 가능한 비밀번호입니다');
			setStep('confirm');
		} else {
			setMessage('사용할 수 없는 비밀번호입니다');
		}
	};
	const handleCheckConfirmPw = async () => {
		if (newPw === confirmPw) {
			await fakeServerChangePw(newPw);
			setMessage('입력한 비밀번호가 일치합니다');
			setStep('done');
			setPopup('비밀번호가 성공적으로 변경되었습니다.');
		} else {
			setMessage('입력한 비밀번호가 일치하지 않습니다');
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
							disabled={step !== 'current'}
						/>
						<button
							className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isCurrentPwValid && step === 'current' ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
							onClick={handleCheckCurrentPw}
							disabled={!isCurrentPwValid || step !== 'current'}
						>확인</button>
					</div>
					{/* 새 비밀번호 입력 */}
					<div className="flex gap-[10px] items-end mb-[6px]">
						<input
							type="password"
							className="flex-1 border-0 border-b border-[#e0e0e0] bg-transparent text-[15px] text-[#1a1a1a] py-2 outline-none"
							placeholder="새로운 비밀번호를 입력해주세요"
							value={newPw}
							onChange={e => setNewPw(e.target.value)}
							disabled={step !== 'new'}
						/>
						<button
							className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isNewPwValid && step === 'new' ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
							onClick={handleCheckNewPw}
							disabled={!isNewPwValid || step !== 'new'}
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
							disabled={step !== 'confirm'}
						/>
						<button
							className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium min-w-[94px] border-none cursor-pointer ${isConfirmPwValid && step === 'confirm' ? 'bg-blue-900 text-white' : 'bg-[#f4f5f7] text-[#a6a6a6]'}`}
							onClick={handleCheckConfirmPw}
							disabled={!isConfirmPwValid || step !== 'confirm'}
						>확인</button>
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
