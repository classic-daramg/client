'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ComposerProfile from './composer-profile';
import FloatingButtons from './floating-buttons';

// --- Mock Data ---
// This data simulates what you would receive from a backend API.
// I've created 5 sample posts.
const mockPosts = [
    {
        id: 1,
        category: '자유글',
        title: '라흐마니노프 피아노 협주곡 2번이 인생곡인 분?',
        content: '오늘처럼 비 오는 날에 들으니 감성이 폭발하네요... 저만 그런가요? 이 곡에 얽힌 추억이 있다면 공유해주세요.',
        tags: ['#라흐마니노프', '#피아노협주곡', '#클래식추천'],
        likes: 28,
        comments: 7,
        author: '낭만피아노',
        timestamp: '3분 전',
        imageUrl: '/images/sample-album-cover.jpg', // Placeholder image path
    },
    {
        id: 2,
        category: '질문',
        title: '라흐마니노프 교향곡 2번 3악장 연주 팁 좀 주세요!',
        content: '아다지오 부분을 정말 아름답게 연주하고 싶은데, 감정 표현이 너무 어렵습니다. 선배님들의 조언을 구합니다.',
        tags: ['#연주팁', '#교향곡2번', '#질문있어요'],
        likes: 15,
        comments: 5,
        author: '열정클라리넷',
        timestamp: '1시간 전',
        imageUrl: null, // No image for this post
    },
    {
        id: 3,
        category: '정보',
        title: '2025년 라흐마니노프 특별 연주회 정보',
        content: '내년 3월 예술의전당에서 라흐마니노프 스페셜 갈라 콘서트가 열린다고 합니다. 티켓팅은 다음 주 월요일 오전 10시!',
        tags: ['#연주회', '#정보공유', '#예술의전당'],
        likes: 42,
        comments: 11,
        author: '클래식인포',
        timestamp: '5시간 전',
        imageUrl: '/images/sample-concert-hall.jpg', // Placeholder image path
    },
    {
        id: 4,
        category: '자유글',
        title: '그의 손은 얼마나 컸을까?',
        content: '라흐마니노프의 손이 엄청나게 커서 13도를 넘게 잡을 수 있었다는 얘기를 들었어요. 정말 대단하지 않나요?',
        tags: ['#잡담', '#TMI'],
        likes: 8,
        comments: 2,
        author: '호기심천국',
        timestamp: '1일 전',
        imageUrl: null, // No image for this post
    },
    {
        id: 5,
        category: '감상',
        title: '보칼리제 들으면서 힐링 중',
        content: '첼로 버전으로 듣고 있는데 마음이 편안해지네요. 여러분의 최애 보칼리제 연주자는 누구인가요?',
        tags: ['#보칼리제', '#감상평', '#힐링'],
        likes: 19,
        comments: 6,
        author: '첼로사랑',
        timestamp: '2일 전',
        imageUrl: '/images/sample-cello.jpg', // Placeholder image path
    },
];

// --- Type Definition for Post Data ---
type Post = (typeof mockPosts)[0];

// --- Reusable Icon Components ---
// Simple SVG icons to match the design.
const CategoryIcon = () => (
    <Image src="/icons/write.svg" alt="카테고리" width={12} height={12} />
);
const LikeIcon = () => (
    <Image src="/icons/heart.svg" alt="좋아요" width={15} height={15} />
);
const CommentIcon = () => (
    <Image src="/icons/message.svg" alt="댓글" width={12} height={12} />
);

// --- Sub-components for Page ---

// Single Post Item Component
function PostItem({ post }: { post: Post }) {
    return (
        <article className="py-4 border-t border-zinc-200">
            <div className="flex justify-between items-start gap-4">
                {/* Post Content */}
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-1 text-zinc-400 text-xs font-semibold">
                        <CategoryIcon />
                        <span>{post.category}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-zinc-900 text-sm font-semibold">{post.title}</h2>
                        <p className="text-neutral-500 text-xs font-medium line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                            {post.tags.map((tag) => (
                                <span key={tag} className="text-zinc-400 text-xs font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                            <div className="flex items-center gap-0.3 text-blue-900">
                                <LikeIcon />
                                <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-blue-900">
                                <CommentIcon />
                                <span>{post.comments}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span>{post.timestamp}</span>
                                <div className="w-px h-2 bg-zinc-300"></div>
                                <span>{post.author}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Image (conditionally rendered) */}
                {post.imageUrl && (
                    <div className="w-24 h-24 flex-shrink-0">
                        <Image
                            src={post.imageUrl}
                            alt="Post image"
                            width={96}
                            height={96}
                            className="rounded-lg object-cover w-full h-full bg-zinc-200"
                        />
                    </div>
                )}
            </div>
        </article>
    );
}


// --- Main Page Component ---
export default async function ComposerTalkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    return (
        <div className="px-5">
            {/* Composer Profile도 id에 맞는 정보로 바뀌어야함 */}
            <ComposerProfile />

            {/* Post List */}
            <section>
                {mockPosts.map((post) => (
                    <Link key={post.id} href={`/composer-talk-room/${id}/${post.id}`}>
                        <PostItem post={post} />
                    </Link>
                ))}
            </section>

            <FloatingButtons />
        </div>
    );
}