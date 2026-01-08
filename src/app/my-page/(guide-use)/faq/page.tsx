'use client';

import React, { useState } from 'react';

const backIcon = '/icons/back.svg';

export default function FAQ() {
	const [expandedId, setExpandedId] = useState<number | null>(null);

	const faqs = [
		{
			id: 1,
			question: '서비스 이용은 무료인가요?',
			answer: '네, 기본적인 서비스는 무료로 이용할 수 있습니다. 다만 프리미엄 기능은 별도의 이용료가 발생할 수 있습니다.',
		},
		{
			id: 2,
			question: '계정을 삭제하려면 어떻게 해야 하나요?',
			answer: '설정 > 계정 관리 > 계정 삭제 에서 계정 삭제를 진행할 수 있습니다. 삭제 후 데이터는 복구될 수 없습니다.',
		},
		{
			id: 3,
			question: '비밀번호를 잊어버렸어요.',
			answer: '로그인 페이지의 "비밀번호 찾기" 버튼을 클릭하고 가입 시 사용한 이메일을 입력하면 비밀번호 재설정 링크를 받을 수 있습니다.',
		},
		{
			id: 4,
			question: '프로필 이미지는 어떻게 변경하나요?',
			answer: '마이페이지 > 프로필 편집 에서 프로필 이미지를 변경할 수 있습니다.',
		},
	];

	const toggleExpand = (id: number) => {
		setExpandedId(expandedId === id ? null : id);
	};

	return (
		<div className="relative w-[375px] min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="flex h-[54px] items-center px-4 bg-white border-b border-[#f4f5f7]">
				<div className="flex gap-[4px] items-center w-full">
					<div className="relative w-6 h-6 flex items-center justify-center">
						<img src={backIcon} alt="back" className="w-[20px] h-[20px]" />
					</div>
					<div className="flex flex-col grow justify-center text-[#1a1a1a] text-[16px] font-semibold">
						<p>자주 묻는 질문</p>
					</div>
				</div>
			</div>

			{/* FAQ List */}
			<div className="flex flex-col w-full">
				{faqs.map((faq) => (
					<div key={faq.id} className="border-b border-[#f4f5f7]">
						<button
							onClick={() => toggleExpand(faq.id)}
							className="w-full px-4 py-4 text-left hover:bg-[#f4f5f7] transition-colors flex items-center justify-between"
						>
							<h3 className="text-[14px] font-semibold text-[#1a1a1a]">{faq.question}</h3>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								className={`transition-transform ${expandedId === faq.id ? 'rotate-180' : ''}`}
							>
								<path d="M3 6L8 11L13 6" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
							</svg>
						</button>
						{expandedId === faq.id && (
							<div className="px-4 py-3 bg-[#f4f5f7] text-[12px] text-[#a6a6a6]">
								{faq.answer}
							</div>
						)}
					</div>
				))}
			</div>

			{/* Home Indicator */}
			<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible" />
		</div>
	);
}
