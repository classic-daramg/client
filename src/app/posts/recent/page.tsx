'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

type PostType = 'FREE' | 'STORY' | 'CURATION';

type Post = {
  id: number;
  title: string;
  content: string;
  hashtags: string[];
  createdAt: string;
  writerNickname: string;
  likeCount: number;
  commentCount: number;
  thumbnailImageUrl: string | null;
  type: PostType;
  primaryComposer: { id: number; koreanName: string; englishName: string } | null;
};

const TYPE_LABEL: Record<PostType, string> = {
  FREE: '자유 글',
  STORY: '작곡가 이야기',
  CURATION: '큐레이션 글',
};

const getRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return date.toLocaleDateString('ko-KR');
};

function PostItem({ post, isFirst }: { post: Post; isFirst?: boolean }) {
  const typeLabel = post.type === 'STORY' && post.primaryComposer
    ? `${post.primaryComposer.koreanName} 이야기`
    : TYPE_LABEL[post.type];
  const typeIcon = post.type === 'CURATION' ? '/icons/white_check.svg' : '/icons/write-white.svg';

  return (
    <Link
      href={`/posts/${post.id}`}
      className={`flex items-start justify-between px-4 py-4 bg-white w-full hover:bg-gray-50 transition-colors font-['Pretendard'] ${!isFirst ? 'border-t border-zinc-200' : ''}`}
    >
      {/* 텍스트 영역 */}
      <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
        {/* 글 타입 라벨 */}
        <div className="flex flex-row items-center gap-[3px]">
          <Image src={typeIcon} alt="글 종류" width={12} height={12} className="brightness-0 opacity-30" />
          <span className="text-[11px] font-semibold text-[#D9D9D9] leading-[13px]">{typeLabel}</span>
        </div>

        {/* 제목 + 본문 */}
        <div className="flex flex-col gap-1 w-full">
          <h3 className="text-[#1A1A1A] text-[14px] font-semibold leading-[17px] line-clamp-1">
            {post.title}
          </h3>
          <p className="text-[#A6A6A6] text-[12px] font-semibold leading-[14px] line-clamp-2">
            {post.content}
          </p>
        </div>

        {/* 해시태그 + 메타 */}
        <div className="flex flex-col gap-1 w-full">
          {post.hashtags.length > 0 && (
            <div className="flex flex-row items-center gap-1 flex-wrap">
              {post.hashtags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[#D9D9D9] text-[12px] font-medium leading-[14px]">#{tag}</span>
              ))}
            </div>
          )}
          <div className="flex flex-row items-center gap-[6px]">
            <div className="flex items-center gap-0.5">
              <Image src="/icons/icons_comment.svg" alt="댓글" width={12} height={12} />
              <span className="text-[12px] font-medium text-[#293A92] leading-[14px]">{post.commentCount}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Image src="/icons/heart.svg" alt="좋아요" width={12} height={12} />
              <span className="text-[12px] font-medium text-[#293A92] leading-[14px]">{post.likeCount}</span>
            </div>
            <span className="text-[12px] font-medium text-[#D9D9D9] leading-[14px]">{getRelativeTime(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 썸네일 */}
      {post.thumbnailImageUrl && (
        <div className="relative w-[96px] h-[96px] bg-[#d9d9d9] rounded-[8px] ml-4 flex-shrink-0 overflow-hidden">
          <Image
            src={post.thumbnailImageUrl}
            alt={post.title}
            width={96}
            height={96}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </Link>
  );
}

export default function RecentPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const loadPosts = useCallback(async (currentCursor: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ size: '10' });
      if (currentCursor) params.append('cursor', currentCursor);
      const res = await apiClient.get<{
        content: Post[];
        nextCursor: string | null;
        hasNext: boolean;
      }>(`/posts/recent?${params.toString()}`);
      const { content, nextCursor, hasNext } = res.data;
      setPosts((prev) => (currentCursor ? [...prev, ...content] : content));
      setCursor(nextCursor);
      setHasMore(hasNext);
    } catch (err) {
      console.error('Failed to fetch recent posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      loadPosts(null);
    }
  }, [loadPosts]);

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPosts(cursor);
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [cursor, hasMore, loading, loadPosts]);

  return (
    <div className="relative w-full max-w-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white w-full h-14 flex items-center px-5 border-b border-zinc-100">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-[#1A1A1A] text-base font-semibold">최근 게시물</h1>
        <div className="w-8" />
      </header>

      {/* 게시물 목록 */}
      <div className="bg-white pb-8">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-16 text-zinc-400 text-sm">
            7일 이내 게시물이 없습니다.
          </div>
        ) : (
          posts.map((post, index) => <PostItem key={post.id} post={post} isFirst={index === 0} />)
        )}
        <div ref={loaderRef} className="py-4 text-center text-zinc-400 text-xs">
          {loading && '게시물을 불러오는 중...'}
        </div>
      </div>
    </div>
  );
}
