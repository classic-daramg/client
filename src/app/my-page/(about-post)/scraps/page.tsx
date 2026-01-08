'use client';

import React from 'react';

// Local SVG assets
const backIcon = '/icons/back.svg';
const scrapIcon = '/icons/scrap.svg';

export default function Scraps() {
	// 샘플 데이터 (디자인용)
	const scraps = [
		{
			id: 1,
			title: '제목이 들어갈 자리입니다',
			content: '글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고',
			tags: ['#태그01', '#태그02', '#태그03'],
			scrapedAt: '25/08/28 14:26',
		},
		{
			id: 2,
			title: '제목이 들어갈 자리입니다',
			content: '글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고',
			tags: ['#태그01', '#태그02', '#태그03'],
			scrapedAt: '25/08/28 14:26',
		},
		{
			id: 3,
			title: '제목이 들어갈 자리입니다',
			content: '글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고',
			tags: ['#태그01', '#태그02', '#태그03'],
			scrapedAt: '25/08/28 14:26',
		},
	];

	return (
		<div className="relative w-[375px] min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="flex flex-col">
				{/* Status Bar */}
				<div className="h-[54px] bg-white pt-[21px]" />

				{/* Header Navigation */}
				<div className="flex h-[54px] items-center px-4 bg-white">
					<div className="flex gap-[4px] items-center w-full">
						<div className="relative w-6 h-6 flex items-center justify-center">
							<img src={backIcon} alt="back" className="w-[20px] h-[20px]" />
						</div>
						<div className="flex flex-col grow justify-center text-[#1a1a1a] text-[16px] font-semibold">
							<p>스크랩한 글</p>
						</div>
					</div>
				</div>
			</div>

			{/* Card List */}
			<div className="absolute bg-white flex flex-col items-start left-0 top-[calc(50%-306px)] w-[375px]">
				{scraps.map((scrap) => (
					<div key={scrap.id} className="box-border flex flex-col gap-[10px] items-center overflow-clip px-[12px] py-[18px] w-full border-b border-[#f4f5f7]">
						<div className="flex items-center justify-center w-[335px]">
							<div className="flex flex-col gap-[8px] grow items-start w-0 min-w-0">
								{/* Label */}
								<div className="flex gap-[3px] items-center">
									<img src={scrapIcon} alt="스크랩글" className="w-4 h-4" />
									<span className="text-[#293A92] text-[11px] font-semibold">스크랩글</span>
								</div>
								{/* Title/Content */}
								<div className="flex flex-col gap-[4px] w-full">
									<div className="text-[#1a1a1a] text-[14px] font-semibold w-full truncate">{scrap.title}</div>
									<div className="text-[#a6a6a6] text-[12px] w-full truncate">{scrap.content}</div>
								</div>
								{/* Tags */}
								<div className="flex gap-[2px] w-full">
									{scrap.tags.map((tag) => (
										<span key={tag} className="text-[#293A92] text-[11px] font-semibold">
											{tag}
										</span>
									))}
								</div>
								{/* Date */}
								<div className="text-[#a6a6a6] text-[11px]">{scrap.scrapedAt}</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Home Indicator */}
			<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[375px] h-[34px] invisible" />
		</div>
	);
}
