"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/apiClient";
import { useDraftStore } from "@/store/draftStore";

// Local SVG assets
const backIcon = "/icons/back.svg";
const curationIcon = "/icons/white_check.svg";
const freeIcon = "/icons/white_pen.svg";
const likeIcon = "/icons/heart.svg";
const commentIcon = "/icons/icons_comment.svg";

interface Draft {
	id: number;
	title: string;
	content: string;
	hashtags: string[];
	createdAt: string;
	writerNickname: string;
	likeCount: number;
	commentCount: number;
	thumbnailImageUrl: string | null;
	type: string;
	primaryComposerId?: number;
	primaryComposerName?: string;
	primaryComposer?: {
		id?: number;
		composerId?: number;
		koreanName?: string;
		englishName?: string;
	} | null;
	isLiked: boolean | null;
	isScrapped: boolean | null;
}

interface DraftsResponse {
	content: Draft[];
	nextCursor: string | null;
	hasNext: boolean;
}

export default function Drafts() {
	const handleSafeBack = useSafeBack("/my-page");
	const { accessToken, userId: storedUserId, getUserIdFromToken } = useAuthStore();
	const { setDraft } = useDraftStore();
	const [drafts, setDrafts] = useState<Draft[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 초기 로드: 임시저장한 글 불러오기
	useEffect(() => {
		const loadDrafts = async () => {
			// userId 가져오기 (저장된 값 또는 토큰에서 추출)
			const userId = storedUserId || getUserIdFromToken();

			if (!userId || !accessToken) {
				setError('사용자 정보를 확인할 수 없습니다');
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				const response = await apiClient.get<DraftsResponse>(`/posts/${userId}/drafts`, {
					params: { size: 10 },
				});

				const data = response.data;
				setDrafts(data.content);
			} catch (error) {
				console.error('Failed to load drafts:', error);
				setError('임시저장한 글을 불러오는 중 오류가 발생했습니다');
			} finally {
				setIsLoading(false);
			}
		};

		loadDrafts();
	}, [accessToken, storedUserId]);

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

	const getTypeIcon = (type: string): string => {
		switch (type) {
			case "CURATION":
				return curationIcon;
			case "FREE":
				return freeIcon;
			default:
				return curationIcon;
		}
	};

	const getTypeLabel = (type: string): string => {
		switch (type) {
			case 'CURATION':
				return '큐레이션글';
			case 'FREE':
				return '자유글';
			case 'STORY':
				return '스토리';
			default:
				return type;
		}
	};

	return (
		<div className="bg-[#f4f5f7] min-h-screen w-full">
			<div className="mx-auto w-full max-w-[375px]">
				<div className="bg-white h-[54px]" />
				<div className="bg-white px-[20px] pb-[12px]">
					<div className="flex items-center gap-[4px]">
						<button
							onClick={handleSafeBack}
							className="bg-none border-none p-0 cursor-pointer w-6 h-6 flex items-center justify-center"
							aria-label="뒤로가기"
						>
							<Image src={backIcon} alt="back" width={20} height={20} />
						</button>
						<div className="text-[#1a1a1a] text-[16px] font-semibold">임시저장한 글</div>
					</div>
				</div>
				<div className="h-[5px] bg-[#f4f5f7]" />
				<div className="bg-white">
					{isLoading && (
						<div className="w-full py-8 text-center text-[#a6a6a6]">
							임시저장한 글을 불러오는 중입니다...
						</div>
					)}
					{error && (
						<div className="w-full py-8 text-center text-red-500">{error}</div>
					)}
					{!isLoading && drafts.length === 0 && !error && (
						<div className="w-full py-8 text-center text-[#a6a6a6]">
							임시저장한 글이 없습니다.
						</div>
					)}
					{drafts.map((draft, index) => {
						const composerId = draft.type === 'STORY' && draft.primaryComposer
							? (draft.primaryComposer.id ?? draft.primaryComposer.composerId)
							: null;
						const href = composerId
							? `/write?draftId=${draft.id}&composerId=${composerId}`
							: `/write?draftId=${draft.id}`;

						return (
						<Link
							key={draft.id}
							href={href}
							onClick={() => setDraft(draft)}
							className={`flex flex-col items-center overflow-clip px-[12px] py-[18px] ${
								index > 0 ? "border-t border-[#f4f5f7]" : ""
							}`}
						>
							<div className="flex items-center justify-center w-[335px]">
								<div className="flex flex-col gap-[8px] grow items-start w-0 min-w-0">
									<div className="flex gap-[3px] items-center">
										<Image src={getTypeIcon(draft.type)} alt={draft.type} width={12} height={12} />
										<span className="text-[#d9d9d9] text-[11px] font-semibold">
											{draft.type === 'STORY' && (draft.primaryComposerName || draft.primaryComposer?.koreanName)
												? `${draft.primaryComposerName || draft.primaryComposer?.koreanName} 이야기`
												: getTypeLabel(draft.type)}
										</span>
									</div>
									<div className="flex flex-col gap-[4px] w-full">
										<div className="text-[#1a1a1a] text-[14px] font-semibold w-full truncate">
											{draft.title}
										</div>
										<div className="text-[#a6a6a6] text-[12px] w-full line-clamp-2">
											{draft.content}
										</div>
									</div>
									<div className="flex flex-col gap-[4px] w-full">
										<div className="flex gap-[4px] text-[#d9d9d9] text-[12px] font-medium whitespace-nowrap overflow-hidden">
											{draft.hashtags.slice(0, 3).map((tag: string) => (
												<span key={tag}>{tag.startsWith("#") ? tag : `#${tag}`}</span>
											))}
										</div>
										<div className="flex gap-[6px] items-center w-full">
											<div className="flex gap-[2px] items-center">
												<Image src={likeIcon} alt="좋아요" width={12} height={12} />
												<span className="text-[#293a92] text-[12px] font-medium">
													{draft.likeCount}
												</span>
											</div>
											<div className="flex gap-[2px] items-center">
												<Image src={commentIcon} alt="댓글" width={12} height={12} />
												<span className="text-[#293a92] text-[12px] font-medium">
													{draft.commentCount}
												</span>
											</div>
											<span className="text-[#d9d9d9] text-[12px] font-medium">
												{formatDate(draft.createdAt)}
											</span>
										</div>
									</div>
								</div>
								{draft.thumbnailImageUrl ? (
									<Image
										src={draft.thumbnailImageUrl}
										alt="thumbnail"
										width={96}
										height={96}
										className="rounded-[8px] w-[96px] h-[96px] ml-4 object-cover"
										unoptimized
									/>
								) : null}
							</div>
						</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
