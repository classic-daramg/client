'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// import { getApiUrl } from '@/lib/api'; // For future API integration

// Reusable Toggle Component (Internal for now)
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		onClick={() => {
			onChange(!checked);
		}}
		className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75 ${checked ? 'bg-[#293a92]' : 'bg-[#e5e7eb]'
			}`}
	>
		<span className="sr-only">Use setting</span>
		<span
			aria-hidden="true"
			className={`${checked ? 'translate-x-[20px]' : 'translate-x-[0px]'}
            pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
		/>
	</button>
);

export default function NotificationSetting() {
	const router = useRouter();

	// Mock state for settings
	// TODO: Replace with API call
	const [settings, setSettings] = useState({
		info: true,       // 정보성 알림 수신
		event: false,     // 이벤트(광고성) 알림 수신
	});

	const handleToggle = (key: keyof typeof settings) => {
		// Optimistic UI update
		const newSettings = { ...settings, [key]: !settings[key] };
		setSettings(newSettings);

		// TODO: Implement API call here
		// console.log('Updating setting:', key, newSettings[key]);
	};

	return (
		<div className="w-full min-h-screen bg-white font-['Pretendard']">
			{/* Header */}
			<div className="w-full bg-white">
				<div className="h-[54px] pt-[21px]" />
				<div className="bg-white px-[20px] pb-[12px]">
					<div className="flex items-center gap-[4px] h-[30px]">
						<button
							type="button"
							onClick={() => router.back()}
							className="flex size-[30px] items-center justify-center p-0"
						>
							<Image src="/icons/back.svg" alt="뒤로가기" width={12} height={24} className="block" />
						</button>
						<h1 className="text-[16px] font-semibold text-[#1a1a1a]">알림 설정</h1>
					</div>
				</div>
			</div>

			{/* Divider */}
			<div className="h-[10px] w-full bg-[#f4f5f7]" />

			{/* Settings List */}
			<div className="w-full bg-white flex flex-col">
				<div className="px-[20px] py-[20px] flex justify-between items-center w-full">
					<div className="flex flex-col gap-[2px]">
						<span className="text-[16px] text-[#1a1a1a] font-medium text-left">정보성 알림 수신</span>
						<span className="text-[12px] text-[#a6a6a6] font-normal leading-4 text-left">업데이트 소식과 공지사항 등을 전해드립니다.</span>
					</div>
					<Toggle
						checked={settings.info}
						onChange={() => handleToggle('info')}
					/>
				</div>
				<div className="px-[20px] py-[20px] flex justify-between items-center w-full border-t border-[#f4f5f7]">
					<div className="flex flex-col gap-[2px]">
						<span className="text-[16px] text-[#1a1a1a] font-medium text-left">이벤트(광고성) 알림 수신</span>
						<span className="text-[12px] text-[#a6a6a6] font-normal leading-4 text-left">이벤트 등 특별한 혜택과 관련된 소식을 전해드립니다.</span>
					</div>
					<Toggle
						checked={settings.event}
						onChange={() => handleToggle('event')}
					/>
				</div>
			</div>
		</div>
	);
}
