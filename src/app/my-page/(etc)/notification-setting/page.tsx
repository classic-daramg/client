'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const backIcon = '/icons/back.svg';

export default function Notification() {
	const router = useRouter();
	const notifications = [
		{
			id: 1,
			title: '새로운 댓글이 달렸습니다',
			content: '회원님의 게시물에 새로운 댓글이 달렸습니다.',
			date: '25/08/28 14:26',
		},
		{
			id: 2,
			title: '좋아요를 받았습니다',
			content: '회원님의 게시물을 누군가 좋아합니다.',
			date: '25/08/27 10:15',
		},
	];

	return (
		<div className="relative w-[375px] min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="flex h-[54px] items-center px-4 bg-white border-b border-[#f4f5f7]">
				<div className="flex gap-[4px] items-center w-full">
					<button
						type="button"
						onClick={() => router.back()}
						className="relative w-6 h-6 flex items-center justify-center"
						aria-label="뒤로가기"
					>
						<Image src={backIcon} alt="back" width={20} height={20} />
					</button>
					<div className="flex flex-col grow justify-center text-[#1a1a1a] text-[16px] font-semibold">
						<p>알림</p>
					</div>
				</div>
			</div>

			{/* Notification List */}
			<div className="flex flex-col w-full">
				{notifications.map((notification) => (
					<div key={notification.id} className="border-b border-[#f4f5f7] px-4 py-4 hover:bg-[#f4f5f7] cursor-pointer transition-colors">
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">{notification.title}</h3>
						<p className="text-[12px] text-[#a6a6a6] mb-2">{notification.content}</p>
						<p className="text-[11px] text-[#d9d9d9]">{notification.date}</p>
					</div>
				))}
			</div>

			{/* Home Indicator */}
			<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible" />
		</div>
	);
}
