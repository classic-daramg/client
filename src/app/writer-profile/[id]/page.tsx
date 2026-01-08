'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

// --- Mock Data: 실제 데이터로 교체될 임시 데이터 ---

// 작성자 정보
const mockWriterData = {
	id: 'writer789',
	name: '사용자닉네임',
	bio: 'BIO는 최대 20자로 합시다',
	profileImage: '/images/writer-profile-placeholder.png', // 실제 이미지 경로로 교체 필요
	followingCount: 3,
	followerCount: 24,
	isFollowing: false, // 현재 사용자가 이 작성자를 팔로우하는지 여부
};

// 작성자의 게시물 목록 (일부 게시물에 thumbnail이 없음)
const mockPosts = [
	{
		id: 1,
		type: '큐레이션글',
		title: '제목이 들어갈 자리입니다',
		content: '글 내용이 들어갈 자리입니다. 글 내용은 한줄 제한을 할까말까 두줄도 괜찮은 것 같고',
		tags: ['#태그01', '#태그02', '#태그03'],
		likes: 3,
		comments: 5,
		timestamp: '25/08/28 14:26',
		thumbnail: '/images/post-thumb-1.png', // 이미지가 있는 경우
	},
	{
		id: 2,
		type: '자유글',
		title: '이미지가 없는 게시물 제목입니다',
		content: '이 게시물은 썸네일 이미지가 없으므로, 텍스트만 표시됩니다. 내용이 길면 잘립니다.',
		tags: ['#테스트', '#샘플'],
		likes: 10,
		comments: 2,
		timestamp: '25/08/27 11:50',
		// thumbnail 속성 없음 (이미지가 없는 경우)
	},
	{
		id: 3,
		type: '큐레이션글',
		title: '세 번째 게시물',
		content: '이것도 이미지가 있는 게시물입니다.',
		tags: ['#추가', '#데이터'],
		likes: 7,
		comments: 1,
		timestamp: '25/08/26 09:10',
		thumbnail: '/images/post-thumb-3.png',
	},
];

// --- Components: 페이지를 구성하는 작은 단위들 ---

// 게시물 하나를 표시하는 컴포넌트
function PostItem({ post }: { post: (typeof mockPosts)[0] }) {
	const displayContent = post.content.length > 24
		? `${post.content.substring(0, 24)}...`
		: post.content;

	return (
		<div className="px-3 py-4 border-t border-gray-200 flex justify-between items-center gap-4">
			<div className="flex flex-col gap-2 flex-1">
				{/* Post Type */}
				<div className="flex items-center gap-1">
					<Image src="/icons/talkIcon.svg" alt="post type" width={12} height={12} />
					<span className="text-xs font-semibold text-gray-500">{post.type}</span>
				</div>
				{/* Title & Content */}
				<div className="flex flex-col gap-1">
					<h3 className="text-sm font-semibold text-zinc-900 truncate">{post.title}</h3>
					<p className="text-xs text-neutral-400">{displayContent}</p>
				</div>
				{/* Tags & Stats */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1 text-xs text-zinc-400">
						{post.tags.map(tag => <span key={tag}>{tag}</span>)}
					</div>
					<div className="flex items-center gap-3 text-xs text-zinc-400">
						<div className="flex items-center gap-0.5 text-blue-900">
							<Image src="/icons/heart.svg" alt="likes" width={12} height={12} />
							<span>{post.likes}</span>
						</div>
						<div className="flex items-center gap-0.5 text-blue-900">
							<Image src="/icons/message.svg" alt="comments" width={12} height={12} />
							<span>{post.comments}</span>
						</div>
						<span>{post.timestamp}</span>
					</div>
				</div>
			</div>
			{/* 썸네일 이미지가 있을 때만 렌더링 */}
			{post.thumbnail && (
				<div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 relative">
					<Image src={post.thumbnail} alt={post.title} fill className="rounded-lg object-cover" />
				</div>
			)}
		</div>
	);
}

// --- Main Page Component ---

export default function WriterProfilePage({ params }: { params: Promise<{ id: string }> }) {
	useEffect(() => {
		params.then(() => {
			// 나중에는 params.id를 사용해 실제 작성자 데이터를 가져옵니다.
		});
	}, [params]);

	// 현재는 목 데이터 사용
	const writer = mockWriterData;
	const [isFollowing, setIsFollowing] = useState(writer.isFollowing);

	const handleFollowToggle = () => {
		setIsFollowing(!isFollowing);
		// 여기에 실제 팔로우/언팔로우 API 호출 로직 추가
	};

	return (
		<div className="w-[375px] mx-auto bg-gray-100 min-h-screen">
			{/* Header */}
			<header className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white h-14">
				<button>
					<Image src="/icons/back.svg" alt="Back" width={24} height={24} />
				</button>
				<h1 className="flex-1 text-base font-semibold text-center text-zinc-900">
					큐레이션 프로필
				</h1>
				<div className="w-6 h-6" /> {/* 오른쪽 공간 확보용 더미 div */}
			</header>

			{/* Profile Section */}
			<div className="flex flex-col gap-2.5">
				<section className="px-5 pt-5 pb-8 bg-white shadow-sm">
					<div className="flex items-center gap-3.5">
						<div className="relative flex-shrink-0 w-16 h-16">
							<Image src={writer.profileImage} alt="Profile" fill className="rounded-full bg-gray-200 object-cover" />
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-zinc-900">{writer.name}</h2>
							<p className="text-xs text-neutral-400">{writer.bio}</p>
							<div className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-blue-900">
								<span>팔로잉</span>
								<span>{writer.followingCount}</span>
								<span className="font-medium">·</span>
								<span>팔로워</span>
								<span>{writer.followerCount + (isFollowing && !writer.isFollowing ? 1 : 0) - (!isFollowing && writer.isFollowing ? 1 : 0)}</span>
							</div>
						</div>
						<div className="flex flex-col gap-2 text-xs font-semibold">
							<button
								onClick={handleFollowToggle}
								className={`px-3 py-1.5 rounded-full ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-blue-900 text-white'}`}
							>
								{isFollowing ? '팔로잉' : '친구맺기'}
							</button>
							<button className="px-3 py-1.5 bg-white border border-stone-300 rounded-full text-zinc-900">
								칭호 목록
							</button>
						</div>
					</div>
				</section>

				{/* Posts List */}
				<section className="bg-white">
					{mockPosts.map(post => (
						<PostItem key={post.id} post={post} />
					))}
				</section>
			</div>
		</div>
	);
}