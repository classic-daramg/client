'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
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
  <Image src="/icons/heart.svg" alt="좋아요" width={17} height={17} />
);
const CommentIcon = () => (
  <Image src="/icons/icons_comment.svg" alt="댓글" width={15} height={15} />
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

function PostsSkeleton() {
  return (
    <div className="space-y-4 py-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-3/4 bg-zinc-200 rounded" />
            <div className="h-3 w-full bg-zinc-200 rounded" />
            <div className="h-3 w-5/6 bg-zinc-200 rounded" />
            <div className="h-3 w-1/3 bg-zinc-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Single Post Item Component ---
function PostItem({ post, composerName }: { post: Post; composerName?: string }) {
  const isCuration = post.type === 'CURATION';
  const postTypeLabel = isCuration ? '큐레이션글' : `${composerName ?? '작곡가'} 이야기`;
  const postTypeIcon = isCuration ? '/icons/white_check.svg' : '/icons/write-white.svg';

  return (
    <article className="py-4 border-t border-zinc-200">
      <div className="flex justify-between items-start gap-4">
        {/* Post Content */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
            <Image src={postTypeIcon} alt="글 종류" width={12} height={12} className="brightness-0 opacity-40" />
            <span>{postTypeLabel}</span>
          </div>
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
export default function ComposerTalkPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [hasLoadedComposer, setHasLoadedComposer] = useState(false);
  const { selectedComposer, selectComposer, hasHydrated } = useComposerStore();
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // params 처리 및 작곡가 데이터 + 포스트 가져오기
  useEffect(() => {
    if (!isClient || !hasHydrated) return;

    const fetchData = async () => {
      const rawId = params?.id;
      const composerId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!composerId || composerId === 'undefined') {
        const fallbackId = selectedComposer?.composerId;
        if (fallbackId) {
          router.replace(`/composer-talk-room/${fallbackId}`);
        } else {
          router.replace('/composer-talk');
        }
        return;
      }

      setLoading(true);

      try {
        const response = await fetchApi(
          `/composers/${composerId}/posts`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.composer) {
            selectComposer(data.composer);
          } else if (!selectedComposer) {
            const composerRes = await fetchApi(
              `/composers/${composerId}`
            );

            if (composerRes.ok) {
              const composerData = await composerRes.json();
              if (composerData) {
                selectComposer(composerData);
              }
            }
          }

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
        setHasLoadedComposer(true);
      }
    };

    // 이미 로드했으면 다시 로드하지 않음
    if (!hasLoadedComposer) {
      fetchData();
    }
  }, [hasHydrated, isClient, params, hasLoadedComposer, router, selectComposer, selectedComposer]);

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

  // 필터링된 게시글 (카테고리 + 검색)
  const filteredPosts = posts.filter(post => {
    // 카테고리 필터
    if (selectedCategory) {
      if (selectedCategory === 'rachmaninoff' && post.type !== 'STORY') return false;
      if (selectedCategory === 'curation' && post.type !== 'CURATION') return false;
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(query);
      const contentMatch = post.content.toLowerCase().includes(query);
      const hashtagMatch = post.hashtags.some(tag => tag.toLowerCase().includes(query));
      if (!titleMatch && !contentMatch && !hashtagMatch) return false;
    }

    return true;
  });

  if (!isClient || !hasHydrated) {
    return null;
  }

  return (
    <>
      <RoomHeader
        onFilterClick={() => setIsFilterOpen(true)}
        composerName={selectedComposer?.koreanName}
        onSearchChange={setSearchQuery}
      />
      {selectedComposer && <ComposerProfile data={selectedComposer} />}
      <div className="px-5">
        <section>
          {filteredPosts.length === 0 ? (
            loading ? (
              <PostsSkeleton />
            ) : (
              <div className="py-10 text-center text-zinc-400">게시글이 없습니다.</div>
            )
          ) : (
            filteredPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <PostItem post={post} composerName={selectedComposer?.koreanName} />
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