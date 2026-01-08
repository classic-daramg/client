'use client';

import React from 'react';

const backIcon = '/icons/back.svg';

export default function Notices() {
	const notices = [
		{
			id: 1,
			title: '서비스 점검 안내',
			content: '2025년 08월 30일 (금) 01:00 ~ 04:00 에 정기 점검을 실시합니다.',
			date: '25/08/28 14:26',
		},
		{
			id: 2,
			title: '새로운 기능 추가',
			content: '글 작성 시 음악을 함께 첨부할 수 있는 기능이 추가되었습니다.',
			date: '25/08/25 10:15',
		},
		{
			id: 3,
			title: '이용약관 개정 안내',
			content: '개인정보 보호 강화를 위해 이용약관이 개정되었습니다. 자세한 내용을 확인해주세요.',
			date: '25/08/20 14:26',
		},
	];

	return (
		<div className="relative w-[375px] min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="flex h-[54px] items-center px-4 bg-white border-b border-[#f4f5f7]">
				<div className="flex gap-[4px] items-center w-full">
					<div className="relative w-6 h-6 flex items-center justify-center">
						<img src={backIcon} alt="back" className="w-[20px] h-[20px]" />
					</div>
					<div className="flex flex-col grow justify-center text-[#1a1a1a] text-[16px] font-semibold">
						<p>공지사항</p>
					</div>
				</div>
			</div>

			{/* Notices List */}
			<div className="flex flex-col w-full">
				{notices.map((notice) => (
					<div
						key={notice.id}
						className="border-b border-[#f4f5f7] px-4 py-4 hover:bg-[#f4f5f7] cursor-pointer transition-colors"
					>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">{notice.title}</h3>
						<p className="text-[12px] text-[#a6a6a6] mb-2">{notice.content}</p>
						<p className="text-[11px] text-[#d9d9d9]">{notice.date}</p>
					</div>
				))}
			</div>

			{/* Home Indicator */}
			<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible" />
		</div>
	);
}
