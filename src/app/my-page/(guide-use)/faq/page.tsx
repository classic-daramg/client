'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function FAQ() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-[#f4f5f7] flex flex-col">
			{/* Header */}
			<header className="flex h-[54px] items-center px-4 bg-white border-b border-[#f4f5f7]">
				<button
					type="button"
					onClick={() => router.back()}
					aria-label="뒤로 가기"
					className="flex items-center justify-center size-6"
				>
					<Image src="/icons/back.svg" alt="뒤로가기" width={20} height={20} />
				</button>
				<h1 className="ml-2 text-[#1a1a1a] text-[16px] font-semibold">FAQ 및 문의하기</h1>
			</header>

			{/* Body */}
			<main className="flex-1 flex flex-col items-center px-6 pt-12 text-center">
				<div className="w-[180px] h-[180px] rounded-full bg-[#49579f] flex items-center justify-center mb-7">
					<Image
						src="/icons/윙크하는다람쥐.svg"
						alt="윙크하는 다람쥐"
						width={180}
						height={180}
						className="object-contain"
						priority
					/>
				</div>
				<div className="text-[#4c4c4c] text-[16px] leading-[22px] font-semibold space-y-1 mb-4">
					<p>FAQ는 추후 서비스 제공 예정입니다.</p>
					<p>서비스 사용 중 궁금하신 사항은</p>
					<p>공식 이메일로 문의 부탁드립니다.</p>
				</div>
				<p className="text-[#a6a6a6] text-[14px] font-semibold">classicsquirrel@gmail.com</p>
			</main>
		</div>
	);
}
