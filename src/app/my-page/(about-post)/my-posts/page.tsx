"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/apiClient";

// Local SVG assets
const backIcon = "/icons/back.svg";
const curationIcon = "/icons/write-blue.svg";

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
	const router = useRouter();
	const { accessToken, userId: storedUserId, getUserIdFromToken } = useAuthStore();
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cursor, setCursor] = useState<string | null>(null);
	const [hasNext, setHasNext] = useState(false);

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

				const params: Record<string, string | number> = { size: 10 };
				if (cursor) {
					params.cursor = cursor;
				}

				const response = await apiClient.get<PostsResponse>(`/posts/${userId}/published`, {
					params,
				});

				const data = response.data;
				setPosts(cursor ? [...posts, ...data.content] : data.content);
				setCursor(data.nextCursor);
				setHasNext(data.hasNext);
			} catch (error) {
				console.error('Failed to load posts:', error);
				setError('작성한 글을 불러오는 중 오류가 발생했습니다');
			} finally {
				setIsLoading(false);
			}
		};

		loadPosts();
	}, [accessToken, storedUserId, getUserIdFromToken]);

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
			case 'CURATION':
				return curationIcon;
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
		<div className="bg-[#f4f5f7] min-h-screen w-full flex flex-col items-center relative">
			{/* Status Bar */}
			<div className="absolute bg-white h-[54px] w-[375px] left-1/2 top-0 -translate-x-1/2" />
			{/* Header */}
			<div className="absolute bg-white flex flex-col gap-[16px] items-start left-0 pt-0 pb-[12px] px-[20px] top-[calc(50%-352px)] w-[375px]">
				<div className="flex gap-[4px] items-center w-full">
					<button
						onClick={() => router.back()}
						className="bg-none border-none p-0 cursor-pointer w-6 h-6 flex items-center justify-center"
						aria-label="뒤로가기"
					>
						<img src={backIcon} alt="back" className="w-[20px] h-[20px]" />
					</button>
					<div className="flex flex-col grow justify-center text-[#1a1a1a] text-[16px] font-semibold">
						<p>내가 작성한 글</p>
					</div>
				</div>
			</div>
			{/* Card List */}
			<div className="absolute bg-white flex flex-col items-start left-0 top-[calc(50%-306px)] w-[375px]">
				{isLoading && (
					<div className="w-full py-8 text-center text-[#a6a6a6]">
						작성한 글을 불러오는 중입니다...
					</div>
				)}
				{error && (
					<div className="w-full py-8 text-center text-red-500">
						{error}
					</div>
				)}
				{!isLoading && posts.length === 0 && !error && (
					<div className="w-full py-8 text-center text-[#a6a6a6]">
						작성한 글이 없습니다.
					</div>
				)}
				{posts.map((post) => (
					<div key={post.id} className="box-border flex flex-col gap-[10px] items-center overflow-clip px-[12px] py-[18px] w-full border-b border-[#f4f5f7]">
						<div className="flex items-center justify-center w-[335px]">
							<div className="flex flex-col gap-[8px] grow items-start w-0 min-w-0">
								{/* Label */}
								<div className="flex gap-[3px] items-center">
									<img src={getTypeIcon(post.type)} alt={post.type} className="w-4 h-4" />
									<span className="text-[#293A92] text-[11px] font-semibold">{getTypeLabel(post.type)}</span>
								</div>
								{/* Title/Content */}
								<div className="flex flex-col gap-[4px] w-full">
									<div className="text-[#1a1a1a] text-[14px] font-semibold w-full truncate">{post.title}</div>
									<div className="text-[#a6a6a6] text-[12px] w-full truncate">{post.content}</div>
								</div>
								{/* Tags/Date */}
								<div className="flex flex-col gap-[4px] w-full">
									<div className="flex gap-[4px] text-[#d9d9d9] text-[12px] font-medium">
										{post.hashtags.map((tag: string) => (
											<span key={tag}>{tag}</span>
										))}
									</div>
									<div className="flex gap-[6px] items-center w-full">
										<span className="text-[#d9d9d9] text-[12px] font-medium">{formatDate(post.createdAt)}</span>
									</div>
								</div>
							</div>
							{/* Thumbnail */}
							{post.thumbnailImageUrl ? (
								<img src={post.thumbnailImageUrl} alt="thumbnail" className="rounded-[8px] w-[96px] h-[96px] ml-4 object-cover" />
							) : (
								<div className="bg-[#d9d9d9] rounded-[8px] w-[96px] h-[96px] ml-4" />
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
