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
		<div className="relative w-full max-w-md mx-auto min-h-screen bg-white flex flex-col font-['Pretendard']">
			{/* Header */}
			<div className="flex has-bottom-border h-[54px] items-center px-4 bg-white border-b border-[#f4f5f7]">
				<div className="flex gap-[4px] items-center w-full">
					<button
						type="button"
						onClick={() => router.back()}
						className="relative w-6 h-6 flex items-center justify-center -ml-1"
						aria-label="뒤로가기"
					>
						<Image src={backIcon} alt="back" width={24} height={24} />
					</button>
					<div className="flex flex-col grow justify-center items-center text-[#1a1a1a] text-[16px] font-semibold pr-6">
						<p>공지사항</p>
					</div>
				</div>
			</div>

			{/* Notices List */}
			<div className="flex flex-col w-full">
				{isLoading && (
					<div className="w-full py-20 text-center text-[#a6a6a6] text-sm">
						공지사항을 불러오는 중입니다...
					</div>
				)}
				{error && (
					<div className="w-full py-20 text-center text-red-500 text-sm">{error}</div>
				)}
				{!isLoading && !error && notices.length === 0 && (
					<div className="w-full py-20 text-center text-[#a6a6a6] text-sm">
						등록된 공지사항이 없습니다.
					</div>
				)}
				{notices.map((notice) => (
					<div
						key={notice.id}
						onClick={() => router.push(`/notice/${notice.id}`)}
						className="border-b border-[#f4f5f7] px-5 py-5 hover:bg-zinc-50 cursor-pointer transition-colors active:bg-zinc-100"
					>
						<div className="flex flex-col gap-1.5">
							<div className="flex justify-between items-start gap-3">
								<h3 className="text-[15px] font-semibold text-[#1a1a1a] line-clamp-1 leading-snug break-all">
									{notice.title}
								</h3>
								{/* If new badge logic exists, add here */}
							</div>
							<div className="flex items-center gap-2 text-xs text-[#a6a6a6] font-medium">
								<span className="line-clamp-1">{notice.content}</span>
								<span>·</span>
								<span className="shrink-0">{formatDate(notice.createdAt)}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
