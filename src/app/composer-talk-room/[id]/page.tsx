'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ComposerProfile from './composer-profile';
import FloatingButtons from './floating-buttons';
import RoomFilter from './filter';
import RoomHeader from './header';
import { useComposerStore } from '@/store/composerStore';

// --- Type Definition for Post Data ---
type Post = {
  id: number;
  title: string;
  content: string;
  hashtags: string[];
  createdAt: string;
  writerNickname: string;
  likeCount: number;
  commentCount: number;
  thumbnailImageUrl?: string | null;
  type: string;
  isLiked: boolean;
  isScrapped: boolean;
};


// --- Reusable Icon Components ---
const LikeIcon = () => (
  <Image src="/icons/heart.svg" alt="좋아요" width={15} height={15} />
);
const CommentIcon = () => (
  <Image src="/icons/message.svg" alt="댓글" width={12} height={12} />
);

// --- Helpers ---
const formatTag = (tag: string) => (tag.length > 5 ? `${tag.slice(0, 4)}...` : tag);

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

// --- Single Post Item Component ---
function PostItem({ post }: { post: Post }) {
  return (
    <article className="py-4 border-t border-zinc-200">
      <div className="flex justify-between items-start gap-4">
        {/* Post Content */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-1">
            <h2 className="text-zinc-900 text-sm font-semibold">{post.title}</h2>
            <p className="text-neutral-500 text-xs font-medium line-clamp-2">{post.content}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.hashtags.map((tag, idx) => (
                <span key={`${tag}-${idx}`} className="text-zinc-400 text-xs font-medium">
                  {formatTag(tag)}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-0.3 text-blue-900">
                <LikeIcon />
                <span>{post.likeCount}</span>
              </div>
              <div className="flex items-center gap-0.5 text-blue-900">
                <CommentIcon />
                <span>{post.commentCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{getRelativeTime(post.createdAt)}</span>
                <div className="w-px h-2 bg-zinc-300"></div>
                <span>{post.writerNickname}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Post Image (conditionally rendered) */}
        {post.thumbnailImageUrl && (
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src={post.thumbnailImageUrl}
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
export default function ComposerTalkPage({ params }: { params: Promise<{ id: string }> }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { selectedComposer, selectComposer } = useComposerStore();

  // params 처리 및 작곡가 데이터 + 포스트 가져오기
  useEffect(() => {
    params.then(async ({ id: composerId }) => {
      setLoading(true);

      // API에서 작곡가 정보 + 포스트 목록 함께 가져오기
      try {
        const response = await fetch(
          `https://classic-daramg.duckdns.org/composers/${composerId}/posts`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();

          // 작곡가 정보 저장
          if (data.composer) {
            selectComposer(data.composer);
          }

          // 포스트 목록 저장
          if (data.posts && data.posts.content) {
            const formattedPosts: Post[] = data.posts.content.map((post: Post) => ({
              id: post.id,
              title: post.title,
              content: post.content,
              hashtags: post.hashtags || [],
              createdAt: post.createdAt,
              writerNickname: post.writerNickname,
              likeCount: post.likeCount,
              commentCount: post.commentCount,
              thumbnailImageUrl: post.thumbnailImageUrl,
              type: post.type,
              isLiked: post.isLiked || false,
              isScrapped: post.isScrapped || false,
            }));
            setPosts(formattedPosts);
            console.log('✅ Composer posts loaded:', formattedPosts);
          }
        } else {
          console.error(`Failed to fetch composer posts: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to fetch composer data:', error);
      } finally {
        setLoading(false);
      }
    });
  }, [params, selectComposer]);

  // 필터 제거 핸들러
  const handleRemoveFilter = (filterId: string) => {
    if (selectedCategory === filterId) {
      setSelectedCategory(null);
    }
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  // 활성 필터 목록
  const activeFilters = selectedCategory ? [selectedCategory] : [];

  // 필터링된 게시글
  const filteredPosts = selectedCategory
    ? posts.filter(post => {
        if (selectedCategory === 'rachmaninoff') return post.type === 'STORY';
        if (selectedCategory === 'curation') return post.type === 'CURATION';
        return true;
      })
    : posts;

  return (
    <>
      <RoomHeader 
        onFilterClick={() => setIsFilterOpen(true)} 
        composerName={selectedComposer?.koreanName}
      />
      {selectedComposer && <ComposerProfile data={selectedComposer} />}
      <div className="px-5">
        <section>
          {loading ? (
            <div className="py-10 text-center text-zinc-400">불러오는 중...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-10 text-center text-zinc-400">게시글이 없습니다.</div>
          ) : (
            filteredPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <PostItem post={post} />
              </Link>
            ))
          )}
        </section>
        <FloatingButtons />
        <RoomFilter
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          composerName={selectedComposer?.koreanName}
        />
      </div>
    </>
  );
}