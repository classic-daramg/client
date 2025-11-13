"use client";
import React from "react";

// Local SVG assets
const backIcon = "/icons/back.svg";
const curationIcon = "/icons/write-blue.svg";

export default function Drafts() {
	// 샘플 데이터 (디자인용)
	const drafts = [
		{
			id: 1,
			title: "제목이 들어갈 자리입니다",
			content: "글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고",
			tags: ["#태그01", "#태그02", "#태그03"],
			savedAt: "25/08/28 14:26",
		},
		{
			id: 2,
			title: "제목이 들어갈 자리입니다",
			content: "글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고",
			tags: ["#태그01", "#태그02", "#태그03"],
			savedAt: "25/08/28 14:26",
		},
		{
			id: 3,
			title: "제목이 들어갈 자리입니다",
			content: "글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고",
			tags: ["#태그01", "#태그02", "#태그03"],
			savedAt: "25/08/28 14:26",
		},
	];

	return (
		<div className="bg-[#f4f5f7] min-h-screen w-full flex flex-col items-center relative">
			{/* Status Bar */}
			<div className="absolute bg-white h-[54px] w-[375px] left-1/2 top-0 -translate-x-1/2" />
			{/* Header */}
			<div className="absolute bg-white flex flex-col gap-[16px] items-start left-0 pt-0 pb-[12px] px-[20px] top-[calc(50%-352px)] w-[375px]">
				<div className="flex gap-[4px] items-center w-full">
					<div className="relative w-6 h-6 flex items-center justify-center">
						<img src={backIcon} alt="back" className="w-[20px] h-[20px]" />
					</div>
					<div className="flex flex-col grow justify-center text-[#1a1a1a] text-[16px] font-semibold">
						<p>임시저장한 글</p>
					</div>
				</div>
			</div>
			{/* Card List */}
			<div className="absolute bg-white flex flex-col items-start left-0 top-[calc(50%-306px)] w-[375px]">
				{drafts.map((draft, idx) => (
					<div key={draft.id} className="box-border flex flex-col gap-[10px] items-center overflow-clip px-[12px] py-[18px] w-full border-b border-[#f4f5f7]">
						<div className="flex items-center justify-center w-[335px]">
							<div className="flex flex-col gap-[8px] grow items-start w-0 min-w-0">
								{/* Label */}
								<div className="flex gap-[3px] items-center">
									<img src={curationIcon} alt="큐레이션글" className="w-4 h-4" />
									<span className="text-[#293A92] text-[11px] font-semibold">큐레이션글</span>
								</div>
								{/* Title/Content */}
								<div className="flex flex-col gap-[4px] w-full">
									<div className="text-[#1a1a1a] text-[14px] font-semibold w-full truncate">{draft.title}</div>
									<div className="text-[#a6a6a6] text-[12px] w-full truncate">{draft.content}</div>
								</div>
								{/* Tags/Date */}
								<div className="flex flex-col gap-[4px] w-full">
									<div className="flex gap-[4px] text-[#d9d9d9] text-[12px] font-medium">
										{draft.tags.map(tag => (
											<span key={tag}>{tag}</span>
										))}
									</div>
									<div className="flex gap-[6px] items-center w-full">
										<span className="text-[#d9d9d9] text-[12px] font-medium">{draft.savedAt}</span>
									</div>
								</div>
							</div>
							{/* Thumbnail */}
							<div className="bg-[#d9d9d9] rounded-[8px] w-[96px] h-[96px] ml-4" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
