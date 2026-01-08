'use client';

import React from 'react';

const backIcon = '/icons/back.svg';

export default function Restrictions() {
	const restrictions = [
		{
			id: 1,
			category: '금지된 콘텐츠',
			items: [
				'폭력적이거나 부적절한 콘텐츠',
				'음란물 및 성인 콘텐츠',
				'광고성 콘텐츠',
				'도배 및 스팸',
				'개인정보 침해',
			],
		},
		{
			id: 2,
			category: '금지된 행동',
			items: [
				'다른 사용자에 대한 괴롭힘 및 따돌림',
				'사기 및 거짓 정보 유포',
				'지적 재산권 침해',
				'계정 거래 및 판매',
				'자동 프로그램 이용',
			],
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
						<p>서비스 이용제한</p>
					</div>
				</div>
			</div>

			{/* Restrictions Content */}
			<div className="flex flex-col w-full">
				{restrictions.map((section) => (
					<div key={section.id} className="border-b border-[#f4f5f7] px-4 py-4">
						<h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">{section.category}</h3>
						<div className="flex flex-col gap-2">
							{section.items.map((item, index) => (
								<div key={index} className="flex gap-2 items-start">
									<span className="text-[12px] text-[#a6a6a6] flex-shrink-0">•</span>
									<p className="text-[12px] text-[#a6a6a6]">{item}</p>
								</div>
							))}
						</div>
					</div>
				))}

				{/* Additional Info */}
				<div className="px-4 py-4 bg-[#f4f5f7]">
					<p className="text-[12px] text-[#a6a6a6] leading-[18px]">
						위 규칙을 위반하는 경우, 경고, 일시 정지, 계정 삭제 등의 조치를 취할 수 있습니다. 자세한 내용은 이용약관을 참고해주세요.
					</p>
				</div>
			</div>

			{/* Home Indicator */}
			<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible" />
		</div>
	);
}
