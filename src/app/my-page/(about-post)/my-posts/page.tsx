"use client";
import React, { useEffect, useState } from 'react';

type Post = {
	id: string;
	title: string;
	content: string;
	createdAt: string;
};

export default function MyPosts() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// 실제 서버 주소로 교체 필요
		fetch('/api/my-posts')
			.then(res => {
				if (!res.ok) throw new Error('서버 오류');
				return res.json();
			})
			.then(data => setPosts(data))
			.catch(e => setError(e.message))
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="bg-white min-h-screen flex flex-col items-center">
			<header className="w-full max-w-[375px] flex items-center px-5 pt-[21px] pb-[12px] bg-white sticky top-0 z-10 border-b border-[#f4f5f7]">
				<h1 className="flex-1 text-center text-[#1a1a1a] text-[16px] font-semibold">내가 작성한 글</h1>
			</header>
			<main className="w-full max-w-[375px] px-5 py-4 flex flex-col gap-4">
				{loading && <div className="text-center text-[#a6a6a6]">불러오는 중...</div>}
				{error && <div className="text-center text-red-500">{error}</div>}
				{!loading && !error && posts.length === 0 && (
					<div className="text-center text-[#bfbfbf]">작성한 글이 없습니다.</div>
				)}
				{posts.map(post => (
					<div key={post.id} className="bg-[#f4f5f7] rounded-lg p-4 flex flex-col gap-2 shadow-sm">
						<div className="text-[#1a1a1a] text-base font-semibold truncate">{post.title}</div>
						<div className="text-[#4c4c4c] text-sm line-clamp-2">{post.content}</div>
						<div className="text-xs text-[#bfbfbf] text-right">{new Date(post.createdAt).toLocaleDateString()}</div>
					</div>
				))}
			</main>
		</div>
	);
}
