'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

const backIcon = '/icons/back.svg';

export default function Notices() {
	const router = useRouter();
	const [notices, setNotices] = useState<Array<{ id: number; title: string; content: string; createdAt: string }>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadNotices = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await apiClient.get('/notice');
				const content = response.data?.content ?? [];
				setNotices(content);
			} catch (err) {
				console.error('Failed to load notices:', err);
				setError('공지사항을 불러오는 중 오류가 발생했습니다.');
			} finally {
				setIsLoading(false);
			}
		};

		loadNotices();
	}, []);

	const formatDate = (dateString: string): string => {
		try {
			const date = new Date(dateString);
			const year = String(date.getFullYear()).slice(-2);
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${year}/${month}/${day} ${hours}:${minutes}`;
		} catch {
			return dateString;
		}
	};

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
						<p>공지사항</p>
					</div>
				</div>
			</div>

			{/* Notices List */}
			<div className="flex flex-col w-full">
				{isLoading && (
					<div className="w-full py-8 text-center text-[#a6a6a6]">
						공지사항을 불러오는 중입니다...
					</div>
				)}
				{error && (
					<div className="w-full py-8 text-center text-red-500">{error}</div>
				)}
				{!isLoading && !error && notices.length === 0 && (
					<div className="w-full py-8 text-center text-[#a6a6a6]">
						공지사항이 없습니다.
					</div>
				)}
				{notices.map((notice) => (
					<div
						key={notice.id}
						className="border-b border-[#f4f5f7] px-4 py-4 hover:bg-[#f4f5f7] cursor-pointer transition-colors"
					>
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">{notice.title}</h3>
						<p className="text-[12px] text-[#a6a6a6] mb-2">{notice.content}</p>
						<p className="text-[11px] text-[#d9d9d9]">{formatDate(notice.createdAt)}</p>
					</div>
				))}
			</div>

			{/* Home Indicator */}
			<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible" />
		</div>
	);
}
