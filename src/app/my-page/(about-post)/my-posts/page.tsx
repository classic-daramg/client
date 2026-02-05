"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/apiClient";

// Local SVG assets
const backIcon = "/icons/back.svg";
const curationIcon = "/icons/white_check.svg";
const freeIcon = "/icons/white_pen.svg";
const likeIcon = "/icons/heart.svg";
const commentIcon = "/icons/icons_comment.svg";

interface Post {
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
	isLiked: boolean | null;
	isScrapped: boolean | null;
}

interface PostsResponse {
	content: Post[];
	nextCursor: string | null;
	hasNext: boolean;
}

export default function MyPosts() {
	const handleSafeBack = useSafeBack("/my-page");
	const { accessToken, userId: storedUserId, getUserIdFromToken } = useAuthStore();
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 초기 로드: 작성한 글 불러오기
	useEffect(() => {
		const loadPosts = async () => {
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

				console.log('Loading posts for userId:', userId);
				const response = await apiClient.get<PostsResponse>(`/posts/${userId}/published`, {
					params: { size: 10 },
				});

				console.log('Posts response:', response.data);
				const data = response.data;
				setPosts(data.content);
			} catch (error) {
				console.error('Failed to load posts:', error);
				setError('작성한 글을 불러오는 중 오류가 발생했습니다');
			} finally {
				setIsLoading(false);
			}
		};

		loadPosts();
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
						<div className="text-[#1a1a1a] text-[16px] font-semibold">작성한 글</div>
					</div>
				</div>
				<div className="h-[5px] bg-[#f4f5f7]" />
				<div className="bg-white">
					{isLoading && (
						<div className="w-full py-8 text-center text-[#a6a6a6]">
							작성한 글을 불러오는 중입니다...
						</div>
					)}
					{error && (
						<div className="w-full py-8 text-center text-red-500">{error}</div>
					)}
					{!isLoading && posts.length === 0 && !error && (
						<div className="w-full py-8 text-center text-[#a6a6a6]">
							작성한 글이 없습니다.
						</div>
					)}
					{posts.map((post, index) => (
						<Link
							key={post.id}
							href={`/posts/${post.id}`}
							className={`flex flex-col items-center overflow-clip px-[12px] py-[18px] ${
								index > 0 ? "border-t border-[#f4f5f7]" : ""
							}`}
						>
							<div className="flex items-center justify-center w-[335px]">
								<div className="flex flex-col gap-[8px] grow items-start w-0 min-w-0">
									<div className="flex gap-[3px] items-center">
										<Image src={getTypeIcon(post.type)} alt={post.type} width={12} height={12} />
										<span className="text-[#d9d9d9] text-[11px] font-semibold">
											{getTypeLabel(post.type)}
										</span>
									</div>
									<div className="flex flex-col gap-[4px] w-full">
										<div className="text-[#1a1a1a] text-[14px] font-semibold w-full truncate">
											{post.title}
										</div>
										<div className="text-[#a6a6a6] text-[12px] w-full line-clamp-2">
											{post.content}
										</div>
									</div>
									<div className="flex flex-col gap-[4px] w-full">
										<div className="flex gap-[4px] text-[#d9d9d9] text-[12px] font-medium whitespace-nowrap overflow-hidden">
											{post.hashtags.slice(0, 3).map((tag: string) => (
												<span key={tag}>{tag.startsWith("#") ? tag : `#${tag}`}</span>
											))}
										</div>
										<div className="flex gap-[6px] items-center w-full">
											<div className="flex gap-[2px] items-center">
												<Image src={likeIcon} alt="좋아요" width={12} height={12} />
												<span className="text-[#293a92] text-[12px] font-medium">
													{post.likeCount}
												</span>
											</div>
											<div className="flex gap-[2px] items-center">
												<Image src={commentIcon} alt="댓글" width={12} height={12} />
												<span className="text-[#293a92] text-[12px] font-medium">
													{post.commentCount}
												</span>
											</div>
											<span className="text-[#d9d9d9] text-[12px] font-medium">
												{formatDate(post.createdAt)}
											</span>
										</div>
									</div>
								</div>
								{post.thumbnailImageUrl ? (
									<Image
										src={post.thumbnailImageUrl}
										alt="thumbnail"
										width={96}
										height={96}
										className="rounded-[8px] w-[96px] h-[96px] ml-4 object-cover"
										unoptimized
									/>
								) : null}
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
